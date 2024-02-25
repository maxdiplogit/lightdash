import { Modal, Tooltip, Box } from '@mantine/core';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useElementSize } from '@mantine/hooks';
import TileBase from '../../DashboardTiles/TileBase';
import EditChartMenuItem from '../../DashboardTiles/EditChartMenuItem';
import SuboptimalState from '../SuboptimalState/SuboptimalState';
import MetricQueryDataProvider from '../../MetricQueryData/MetricQueryDataProvider';
import UnderlyingDataModal from '../../MetricQueryData/UnderlyingDataModal';
import { DrillDownModal } from '../../MetricQueryData/DrillDownModal';
import { DashboardChartTileMain, DashboardChartTileMinimal } from '../../DashboardTiles/DashboardChartTile';
import { useApp } from '../../../providers/AppProvider';
import { IconAlertCircle } from '@tabler/icons-react';


const DashboardFullScreenChartModal: FC = (props) => {
    const { projectUuid } = useParams<{
        projectUuid: string;
        dashboardUuid: string;
    }>();
    const { user } = useApp();
    const userCanManageChart = user.data?.ability?.can('manage', 'SavedChart');
    const modalContentElementSize = useElementSize();

    if (props.isLoading) {
        return (
            <TileBase
                isEditMode={props.isEditMode}
                chartName={props.tile.properties.chartName ?? ''}
                titleHref={`/projects/${props.rest.projectUuid}/saved/${props.tile.properties.savedChartUuid}/`}
                description={''}
                belongsToDashboard={props.tile.properties.belongsToDashboard}
                tile={props.tile}
                isLoading={props.isLoading}
                title={props.tile.properties.title || props.tile.properties.chartName || ''}
                extraMenuItems={
                    !props.minimal &&
                    userCanManageChart &&
                    props.tile.properties.savedChartUuid && (
                        <EditChartMenuItem tile={props.tile} />
                    )
                }
                minimal={props.minimal}
                {...(props.rest)}
            />
        );
    }

    if (props.error !== null || !props.data)
        return (
            <TileBase
                title=""
                isEditMode={props.isEditMode}
                tile={props.tile}
                extraMenuItems={
                    props.tile.properties.savedChartUuid && (
                        <Tooltip
                            disabled={!props.isEditMode}
                            label="Finish editing dashboard to edit this chart"
                        >
                            <Box>
                                <EditChartMenuItem
                                    tile={props.tile}
                                    disabled={props.isEditMode}
                                />
                            </Box>
                        </Tooltip>
                    )
                }
                {...(props.rest)}
            >
                <SuboptimalState
                    icon={IconAlertCircle}
                    title={props.error?.error?.message || 'No data available'}
                ></SuboptimalState>
            </TileBase>
        );
    
    console.log(props);
    return (
        <Modal.Root
            centered
            opened
            onClose={props.onCloseFullScreenChartModal}
            size="auto"
        >
            <Modal.Overlay />
            <Modal.Content
                ref={modalContentElementSize.ref}
                sx={{
                    height: 'calc(100dvh - (1rem * 2))',
                    width: 'calc(100dvw - (1rem * 2))',
                    overflowY: 'hidden',
                }}
            >
                <MetricQueryDataProvider
                    metricQuery={props.data?.metricQuery}
                    tableName={props.data?.chart.tableName || ''}
                    explore={props.data?.explore}
                >
                    {props.minimal ? (
                        <DashboardChartTileMinimal
                            {...(props.rest)}
                            tile={props.tile}
                            isEditMode={props.isEditMode}
                            chartAndResults={props.data}
                        />
                    ) : (
                        <DashboardChartTileMain
                            {...(props.rest)}
                            tile={props.tile}
                            isEditMode={props.isEditMode}
                            chartAndResults={props.data}
                            isChartOpenedInFullScreen={true}
                            onCloseFullScreenChartModelX={props.onCloseFullScreenChartModal}
                        />
                    )}
                    <UnderlyingDataModal isInChartFullScreen={true} />
                    <DrillDownModal />
                </MetricQueryDataProvider>
                <Modal.CloseButton />
            </Modal.Content>
        </Modal.Root>
    );
};

export default DashboardFullScreenChartModal;