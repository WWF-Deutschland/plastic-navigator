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
import { intlShape, injectIntl } from 'react-intl';
import { getSourcesFromCountryFeaturesWithPosition } from 'utils/policy';

import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import CountryPolicySinglePosition from './CountryPolicySinglePosition';
import ListItemHeader from './ListItemHeader';
import Title from './Title';

export function SourceContent({
  sourceId,
  config, // layer config
  layerData,
  onLoadLayer,
  supTitle,
  onSetLayerInfo,
  intl,
}) {
  useEffect(() => {
    onLoadLayer(config.id, config);
  }, [config]);

  const { locale } = intl;

  if (!sourceId || !config || !layerData) return null;
  // const feature = findFeature(layerData.data.features, featureId);
  // if (!feature) return <LayerContent config={config} />;
  const [, xSourceId] = sourceId.split('-');
  const sources = getSourcesFromCountryFeaturesWithPosition(
    config,
    layerData.data.features,
    locale,
  );
  const source = sources[xSourceId];
  // console.log(source)
  return (
    <>
      <ListItemHeader
        supTitle={supTitle}
        onClick={() => onSetLayerInfo(config.id, 'sources')}
      />
      <Title>{source.label || source.id}</Title>
      {source && (
        <CountryPolicySinglePosition
          source={source}
          position={source.position}
          config={config}
          listCountries
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
  supTitle: PropTypes.string,
  layerData: PropTypes.object,
  intl: intlShape.isRequired,
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

export default compose(withConnect)(injectIntl(SourceContent));
