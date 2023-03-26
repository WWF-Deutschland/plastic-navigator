/**
 *
 * SourceList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { intlShape, injectIntl } from 'react-intl';

import { POLICY_LAYER } from 'config';
import { useInjectSaga } from 'utils/injectSaga';
import { filterSources } from 'utils/string';

import saga from 'containers/Map/saga';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';
import { setLayerInfo } from 'containers/App/actions';

import coreMessages from 'messages';
import {
  excludeCountryFeatures,
  getSourcesFromCountryFeaturesWithPosition,
} from './utils';

import ListItemHeader from '../ListItemHeader';
import FeatureList from '../FeatureList';

export function SourceList({
  onLoadLayer,
  config,
  layer,
  intl,
  onSetLayerInfo,
  supTitle,
}) {
  useInjectSaga({ key: 'map', saga });

  useEffect(() => {
    // kick off loading of page content
    if (config && POLICY_LAYER === config.id) {
      onLoadLayer(config.id, config);
    }
  }, [config]);

  const { locale } = intl;

  if (
    !config ||
    POLICY_LAYER.indexOf(config.id) === -1 ||
    !layer ||
    !layer.data ||
    !layer.data.features
  ) {
    return null;
  }

  const sources = getSourcesFromCountryFeaturesWithPosition(
    config,
    excludeCountryFeatures(config, layer.data.features),
    locale,
  );

  return sources ? (
    <>
      <ListItemHeader
        supTitle={supTitle}
        onClick={() => onSetLayerInfo(config.id)}
      />
      <FeatureList
        title={intl.formatMessage(coreMessages.sources, {
          count: Object.keys(sources).length,
          isSingle: Object.keys(sources).length === 1,
        })}
        layerId={config.id}
        items={Object.values(sources)}
        config={config}
        search={filterSources}
        isSourceList
      />
    </>
  ) : null;
}

SourceList.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
  onSetLayerInfo: PropTypes.func.isRequired,
  config: PropTypes.object,
  layer: PropTypes.object,
  supTitle: PropTypes.string,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layer: (state, { config }) => {
    if (config && POLICY_LAYER === config.id) {
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
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(SourceList));
