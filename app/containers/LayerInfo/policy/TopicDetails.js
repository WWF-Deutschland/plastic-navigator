import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Box } from 'grommet';

import { selectPositionsOverTimeForTopic } from 'containers/Map/selectors';

import LayerContent from '../LayerContent';
import PanelBody from '../PanelBody';
import CountryChart from './CountryChart';
export function TopicDetails({
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

TopicDetails.propTypes = {
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
const mapStateToProps = createStructuredSelector({
  positionsOverTime: (state, { topic }) =>
    selectPositionsOverTimeForTopic(state, { indicatorId: topic.id }),
});
const withConnect = connect(mapStateToProps);
export default compose(withConnect)(TopicDetails);
