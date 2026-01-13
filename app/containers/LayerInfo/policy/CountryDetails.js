import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import LayerContent from '../LayerContent';
import PanelBody from '../PanelBody';
import CountryChart from './CountryChart';
export function CountryDetails({
  layerInfo,
  topic,
  onSelectStatement,
  onSetChartDate,
  chartDate,
  config,
  layerId,
  isTopicArchived,
  positionsOverTime,
}) {
  console.log('positionsOverTime', positionsOverTime)
  // console.log('layerInfo.data', layerInfo && layerInfo.data)
  return (
    <PanelBody>
      <Box margin={{ top: 'medium' }} responsive={false}>
        {positionsOverTime && (
          <CountryChart
            config={config}
            indicator={topic}
            layerInfo={layerInfo}
            onSelectStatement={sid => onSelectStatement(sid, layerId)}
            onSetChartDate={onSetChartDate}
            chartDate={chartDate}
            isArchive={isTopicArchived}
            positionsOverTime={positionsOverTime}
          />
        )}
      </Box>
      <LayerContent fullLayerId={layerId} config={config} />
    </PanelBody>
  );
}

CountryDetails.propTypes = {
  layerInfo: PropTypes.object,
  positionsOverTime: PropTypes.object,
  topic: PropTypes.object,
  config: PropTypes.object,
  onSelectStatement: PropTypes.func,
  onSetChartDate: PropTypes.func,
  chartDate: PropTypes.string,
  layerId: PropTypes.string,
  isTopicArchived: PropTypes.bool,
};
export default CountryDetails;
