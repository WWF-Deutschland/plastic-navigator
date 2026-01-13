/**
 *
 * Key
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { selectChartDate } from 'containers/App/selectors';
import { selectPositionsOverTimeForTopic } from 'containers/Map/selectors';

import KeyFull from 'components/KeyFull';

export function KeyFullWrapper({
  config,
  layerInfo,
  excludeEmpty,
  indicatorId,
  chartDate,
  positionsOverTime,
}) {
  return (
    <KeyFull
      config={config}
      layerInfo={layerInfo}
      excludeEmpty={excludeEmpty}
      indicatorId={indicatorId}
      chartDate={chartDate}
      positionsOverTime={positionsOverTime}
    />
  );
}

KeyFullWrapper.propTypes = {
  layerInfo: PropTypes.object, // { config, data }
  config: PropTypes.object, // { config, data }
  positionsOverTime: PropTypes.object,
  indicatorId: PropTypes.string,
  chartDate: PropTypes.string,
  excludeEmpty: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  chartDate: state => selectChartDate(state),
  positionsOverTime: (state, { indicatorId, config }) =>
    selectPositionsOverTimeForTopic(state, {
      indicatorId,
      layerKey: config.id,
    }),
});

const withConnect = connect(mapStateToProps);

export default compose(withConnect)(KeyFullWrapper);
// export default Key;
