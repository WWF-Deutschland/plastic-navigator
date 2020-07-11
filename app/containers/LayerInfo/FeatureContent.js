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
import { Button, Heading } from 'grommet';
import { Previous } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYER } from 'config';

import { findFeature } from 'utils/layers';

import { selectLocale } from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import { getPropertyByLocale } from 'containers/Map/utils';

import LayerContent from './LayerContent';
import CountryPolicyCommitments from './CountryPolicyCommitments';

const Styled = styled.div``;
const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;
const SupTitle = styled(p => <Button {...p} plain />)``;

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
  if (!config.id === POLICY_LAYER || !config.tooltip) {
    return <LayerContent layer={config} />;
  }
  const feature = findFeature(layerData.data.features, featureId);
  if (!feature) return <LayerContent config={config} />;
  const supTitle = config.title[locale] || config.title[DEFAULT_LOCALE];
  return (
    <Styled>
      <div>
        <Button
          plain
          onClick={() => onSetLayerInfo(config.id)}
          icon={<Previous size="large" />}
        />
      </div>
      <div>
        <SupTitle onClick={() => onSetLayerInfo(config.id)} label={supTitle} />
      </div>
      <Title>{getTitle(feature, config, locale)}</Title>
      {config.id === POLICY_LAYER && (
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
