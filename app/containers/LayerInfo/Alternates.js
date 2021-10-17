import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { intlShape, injectIntl } from 'react-intl';
// import styled from 'styled-components';

import {
  selectActiveLayers,
  selectLayersConfig,
} from 'containers/App/selectors';
import { toggleLayer } from 'containers/App/actions';

import GroupLayers from 'components/GroupLayers';

export function Alternates({
  config,
  layersConfig,
  activeLayers,
  intl,
  onToggleLayer,
}) {
  const altLayers = [config.id, config.alternate];
  const { locale } = intl;

  if (!layersConfig) return null;
  return (
    <GroupLayers
      layersConfig={layersConfig.filter(
        layer => altLayers.indexOf(layer.id) > -1,
      )}
      locale={locale}
      activeLayers={activeLayers}
      onToggleLayer={onToggleLayer}
    />
  );
}

Alternates.propTypes = {
  onToggleLayer: PropTypes.func.isRequired,
  config: PropTypes.object,
  layersConfig: PropTypes.array,
  activeLayers: PropTypes.array,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  activeLayers: state => selectActiveLayers(state),
  layersConfig: state => selectLayersConfig(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onToggleLayer: id => dispatch(toggleLayer(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(Alternates));
