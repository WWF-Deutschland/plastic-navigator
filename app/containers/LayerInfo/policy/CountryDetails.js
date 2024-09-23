import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import {
  getCountryPositionsOverTimeFromCountryFeatures,
  getCountryAggregatePositionsOverTime,
  isAggregate,
} from 'utils/policy';

import LayerContent from '../LayerContent';
import PanelBody from '../PanelBody';
import CountryChart from './CountryChart';
export function CountryDetails({
  layerInfo,
  indicator,
  onSelectStatement,
  onSetChartDate,
  chartDate,
  config,
  layerId,
  isTopicArchived,
}) {
  const indicatorId = indicator.id;
  let positionsOverTime;
  if (isAggregate(indicator)) {
    positionsOverTime =
      layerInfo &&
      layerInfo.data &&
      getCountryAggregatePositionsOverTime({
        indicator,
        layerInfo,
      });
  } else {
    positionsOverTime =
      layerInfo &&
      layerInfo.data &&
      getCountryPositionsOverTimeFromCountryFeatures({
        indicatorId,
        layerInfo,
        includeOpposing: false,
        includeWithout: false,
        includeHidden: false,
      });
  }
  // console.log('positionsOverTime', positionsOverTime)
  return (
    <PanelBody>
      <Box margin={{ top: 'medium' }} responsive={false}>
        {positionsOverTime && (
          <CountryChart
            config={config}
            indicator={indicator}
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
  indicator: PropTypes.object,
  config: PropTypes.object,
  onSelectStatement: PropTypes.func,
  onSetChartDate: PropTypes.func,
  chartDate: PropTypes.string,
  layerId: PropTypes.string,
  isTopicArchived: PropTypes.bool,
};
export default CountryDetails;
