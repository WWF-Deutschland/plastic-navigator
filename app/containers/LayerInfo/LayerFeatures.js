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

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/Map/saga';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import coreMessages from 'messages';

import FeatureList from './FeatureList';

export function LayerFeatures({ onLoadLayer, config, layer, intl }) {
  useInjectSaga({ key: 'map', saga });

  useEffect(() => {
    // kick off loading of page content
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      onLoadLayer(config.id, config);
    }
  }, [config]);
  const { locale } = intl;
  if (POLICY_LAYERS.indexOf(config.id) === -1 || !layer) return null;

  return (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries)}
      layerId={config.id}
      items={layer.data.features
        .filter(f => {
          if (config.info) {
            const ps = config.info.property.split('.');
            const propertyArray = f.properties[ps[0]];
            const otherProps = ps.slice(1);
            return propertyArray.find(prop => {
              const propDeep = otherProps.reduce((memo, p) => memo[p], prop);
              return config.info.values.indexOf(propDeep) > -1;
            });
          }
          return true;
        })
        .map(f => ({
          id: f.properties.f_id,
          label:
            f.properties[`name_${locale}`] ||
            f.properties[`name_${DEFAULT_LOCALE}`],
        }))}
    />
  );
}

LayerFeatures.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
  config: PropTypes.object,
  layer: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layer: (state, { config }) => {
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      return selectLayerByKey(state, config.id);
    }
    return null;
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (id, config) => {
      dispatch(loadLayer(id, config));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(LayerFeatures));
