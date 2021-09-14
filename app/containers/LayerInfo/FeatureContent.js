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
import { POLICY_LAYERS } from 'config';

import { findFeature } from 'utils/layers';

import { selectLocale } from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import { getPropertyByLocale } from 'containers/Map/utils';

import Title from './Title';
import LayerContent from './LayerContent';
import CountryPolicyCommitments from './CountryPolicyCommitments';
import ListItemHeader from './ListItemHeader';

const getTitle = (feature, config, locale) => {
  if (config.tooltip.title.propertyByLocale) {
    return getPropertyByLocale(
      feature.properties,
      config.tooltip.title,
      locale,
    );
  }
  return config.tooltip.title[locale];
};

export function FeatureContent({
  featureId,
  config, // layer config
  locale,
  layerData,
  onLoadLayer,
  supTitle,
  onSetLayerInfo,
  isCountry,
}) {
  useEffect(() => {
    onLoadLayer(config.id, config);
  }, [config]);
  if (!featureId || !config || !layerData) return null;
  if (POLICY_LAYERS.indexOf(config.id) === -1 || !config.tooltip) {
    return <LayerContent config={config} />;
  }
  const feature = findFeature(layerData.data.features, featureId);
  if (!feature) return <LayerContent config={config} />;
  return (
    <>
      <ListItemHeader
        supTitle={supTitle}
        onClick={() =>
          isCountry
            ? onSetLayerInfo(config.id, 'countries')
            : onSetLayerInfo(config.id)
        }
      />
      <Title>{getTitle(feature, config, locale)}</Title>
      {isCountry && (
        <CountryPolicyCommitments feature={feature} config={config} />
      )}
    </>
  );
}

FeatureContent.propTypes = {
  onLoadLayer: PropTypes.func,
  onSetLayerInfo: PropTypes.func,
  config: PropTypes.object,
  featureId: PropTypes.string,
  locale: PropTypes.string,
  supTitle: PropTypes.string,
  isCountry: PropTypes.bool,
  layerData: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
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

export default compose(withConnect)(FeatureContent);
