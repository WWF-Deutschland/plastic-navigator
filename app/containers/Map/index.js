/**
 *
 * Map
 *
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import L from 'leaflet';

import { MAPBOX } from 'config';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
// import { isMinSize } from 'utils/responsive';
// import commonMessages from 'messages';
//
// import messages from './messages';

import { selectActiveLayers } from 'containers/App/selectors';
import reducer from './reducer';
import saga from './saga';
import { selectLayers, selectLayerConfig } from './selectors';
import { loadLayer } from './actions';

const Styled = styled.div`
  background: ${({ theme }) => theme.global.colors['light-1']};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;
const MapContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: light-grey;
`;

export function Map({ layerConfig, layerIds }) {
  useInjectReducer({ key: 'map', reducer });
  useInjectSaga({ key: 'map', saga });

  const mapRef = useRef(null);
  const basemapLayerGroupRef = useRef(null);
  const rasterLayerGroupRef = useRef(null);

  // init map
  useEffect(() => {
    mapRef.current = L.map('ll-map', {
      center: [30, 180],
      zoom: 2,
    });
    mapRef.current.createPane('rasterPane');
    mapRef.current.getPane('rasterPane').style.zIndex = 600;
    mapRef.current.getPane('rasterPane').style.pointerEvents = 'none';
    basemapLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    rasterLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);
  useEffect(() => {
    if (layerConfig) {
      const basemapConfig =
        layerConfig && layerConfig.find(c => c.id === 'basemap');
      if (basemapConfig.type === 'vector-tiles') {
        basemapLayerGroupRef.current.addLayer(
          L.tileLayer(MAPBOX.STYLE_URL_TEMPLATE, {
            style_id: basemapConfig['style-id'],
            username: MAPBOX.USER,
            accessToken: MAPBOX.TOKEN,
          }),
        );
      }
    }
  }, [layerConfig]);

  useEffect(() => {
    if (layerIds && layerConfig) {
      if (rasterLayerGroupRef) {
        rasterLayerGroupRef.current.clearLayers();
      }
      layerIds.forEach(id => {
        const config = layerConfig.find(c => c.id === id);
        if (config) {
          if (config.type === 'raster-tiles' && config.source === 'mapbox') {
            if (rasterLayerGroupRef) {
              console.log('add layer', config);
              rasterLayerGroupRef.current.addLayer(
                L.tileLayer(MAPBOX.RASTER_URL_TEMPLATE, {
                  id: config.tileset,
                  accessToken: MAPBOX.TOKEN,
                  pane: 'rasterPane',
                }),
              );
            }
          }
        }
      });
    }
  }, [layerIds]);

  return (
    <Styled>
      <MapContainer id="ll-map" />
    </Styled>
  );
}

Map.propTypes = {
  layerConfig: PropTypes.array,
  layerIds: PropTypes.array,
  // onLoadLayer: PropTypes.func,
  // locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  layers: state => selectLayers(state),
  layerConfig: state => selectLayerConfig(state),
  layerIds: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Map);
