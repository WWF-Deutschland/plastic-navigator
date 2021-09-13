/**
 *
 * LayerInfo
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
// import { FormattedMessage } from 'react-intl';
import { getSourcesFromCountryFeaturesWithPosition } from 'utils/positions';

import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import CountryPolicySinglePosition from './CountryPolicySinglePosition';
import ListItemHeader from './ListItemHeader';

export function SourceContent({
  sourceId,
  config, // layer config
  layerData,
  onLoadLayer,
  title,
  onSetLayerInfo,
}) {
  useEffect(() => {
    onLoadLayer(config.id, config);
  }, [config]);
  if (!sourceId || !config || !layerData) return null;
  // const feature = findFeature(layerData.data.features, featureId);
  // if (!feature) return <LayerContent config={config} />;
  const [, xSourceId] = sourceId.split('-');
  const sources = getSourcesFromCountryFeaturesWithPosition(
    config,
    layerData.data.features,
  );
  const source = sources[xSourceId];
  return (
    <>
      <ListItemHeader
        title={title}
        onClick={() => onSetLayerInfo(config.id, 'sources')}
      />
      {source && (
        <CountryPolicySinglePosition
          source={source}
          position={source.position}
          config={config}
        />
      )}
    </>
  );
}
// <Title>{getTitle(feature, config, locale)}</Title>
// <CountryPolicyCommitments feature={feature} config={config} />

SourceContent.propTypes = {
  onLoadLayer: PropTypes.func,
  onSetLayerInfo: PropTypes.func,
  config: PropTypes.object,
  sourceId: PropTypes.string,
  title: PropTypes.string,
  layerData: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onSetLayerInfo: (id, view) => {
      dispatch(setLayerInfo(id, view));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(SourceContent);
