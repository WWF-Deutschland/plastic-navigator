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
import styled from 'styled-components';
import { Box, Button } from 'grommet';
import { ArrowLeftL } from 'components/Icons';

import { DEFAULT_LOCALE } from 'i18n';
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

const Styled = styled.div``;

const SupTitle = styled(p => <Button {...p} plain />)`
  text-transform: uppercase;
  font-weight: bold;
`;

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
  onSetLayerInfo,
  layerData,
  onLoadLayer,
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
  const supTitle = config.title[locale] || config.title[DEFAULT_LOCALE];
  return (
    <Styled>
      <Box direction="row" align="center">
        <Button
          plain
          onClick={() => onSetLayerInfo(config.id)}
          icon={<ArrowLeftL />}
        />
        <SupTitle onClick={() => onSetLayerInfo(config.id)} label={supTitle} />
      </Box>
      <Title>{getTitle(feature, config, locale)}</Title>
      {POLICY_LAYERS.indexOf(config.id) > -1 && (
        <CountryPolicyCommitments feature={feature} config={config} />
      )}
    </Styled>
  );
}

FeatureContent.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  onLoadLayer: PropTypes.func,
  config: PropTypes.object,
  featureId: PropTypes.string,
  locale: PropTypes.string,
  layerData: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FeatureContent);
