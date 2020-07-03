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
import { scalePow } from 'd3-scale';

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
import { selectLayers, selectLayerConfig, selectMapLayers } from './selectors';
import { loadLayer, setMapLayers } from './actions';

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

const getRange = (allFeatures, attribute) =>
  allFeatures.reduce(
    (range, f) => {
      const val = f.properties && parseFloat(f.properties[attribute]);
      return {
        min: range.min ? Math.min(range.min, val) : val,
        max: range.min ? Math.max(range.max, val) : val,
      };
    },
    {
      min: null,
      max: null,
    },
  );

const scaleCircle = (feature, range, config) => {
  const val =
    feature.properties && parseFloat(feature.properties[config.attribute]);
  const scale = scalePow()
    .exponent(config.exp || 0.5)
    .domain([0, range.max])
    .range([0, config.max]);
  return Math.max(config.min, scale(val));
};

const coordinatesToLatLon = coordinates =>
  coordinates &&
  coordinates.length > 0 &&
  coordinates[0].map(coord =>
    coord.length === 2 ? [coord[1], coord[0]] : null,
  );

export function Map({
  layerConfig,
  layerIds,
  mapLayers,
  onSetMapLayers,
  onLoadLayer,
  jsonLayers,
}) {
  useInjectReducer({ key: 'map', reducer });
  useInjectSaga({ key: 'map', saga });

  const mapRef = useRef(null);
  const basemapLayerGroupRef = useRef(null);
  const rasterLayerGroupRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);

  // init map
  useEffect(() => {
    mapRef.current = L.map('ll-map', {
      center: [30, 180],
      zoom: 2,
    });
    mapRef.current.createPane('rasterPane');
    mapRef.current.getPane('rasterPane').style.zIndex = 600;
    mapRef.current.getPane('rasterPane').style.pointerEvents = 'none';
    mapRef.current.createPane('vectorPane');
    mapRef.current.getPane('vectorPane').style.zIndex = 700;
    basemapLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    rasterLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    vectorLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
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
      const newMapLayers = {};
      // remove layers no longer active
      Object.keys(mapLayers).forEach(id => {
        if (layerIds.indexOf(id) < 0) {
          const config = layerConfig.find(c => c.id === id);
          if (config && mapLayers[id]) {
            const { layer } = mapLayers[id];
            if (config.type === 'raster-tiles') {
              rasterLayerGroupRef.current.removeLayer(layer);
            }
            if (config.type === 'geojson') {
              vectorLayerGroupRef.current.removeLayer(layer);
            }
          }
        }
      });
      // add layers not already present
      layerIds.forEach(id => {
        if (Object.keys(mapLayers).indexOf(id) < 0) {
          const config = layerConfig.find(c => c.id === id);
          if (config) {
            if (config.type === 'raster-tiles' && config.source === 'mapbox') {
              if (rasterLayerGroupRef) {
                const layer = L.tileLayer(MAPBOX.RASTER_URL_TEMPLATE, {
                  id: config.tileset,
                  accessToken: MAPBOX.TOKEN,
                  pane: 'rasterPane',
                });
                rasterLayerGroupRef.current.addLayer(layer);
                newMapLayers[id] = { layer, config };
              }
            }
            if (config.type === 'geojson' && config.source === 'data') {
              // kick of loading of vector data for group if not present
              if (!jsonLayers[id]) {
                onLoadLayer(id, config);
              }
              if (jsonLayers[id] && vectorLayerGroupRef) {
                const { data } = jsonLayers[id];
                // polyline-beziewr
                if (
                  config.render &&
                  config.render.type === 'polyline' &&
                  data.features
                ) {
                  const layer = L.featureGroup();
                  data.features.forEach(feature => {
                    if (feature.geometry && feature.geometry.coordinates) {
                      layer.addLayer(
                        L.polyline(
                          coordinatesToLatLon(feature.geometry.coordinates),
                          {
                            pane: 'vectorPane',
                          },
                        ),
                      );
                    }
                  });
                  vectorLayerGroupRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }

                // regular point marker
                if (config.render && config.render.type === 'marker') {
                  const layer = L.geoJSON(data, {
                    pointToLayer: (feature, latlng) =>
                      L.marker(latlng, {
                        pane: 'vectorPane',
                      }),
                  });
                  vectorLayerGroupRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }
                // scaled circle marker
                if (config.render && config.render.type === 'scaledCircle') {
                  const range = getRange(
                    data.features,
                    config.render.attribute,
                  );
                  const layer = L.geoJSON(data, {
                    pointToLayer: (feature, latlng) =>
                      L.circleMarker(latlng, {
                        pane: 'vectorPane',
                        radius: scaleCircle(feature, range, config.render),
                        ...config.style,
                      }),
                  });
                  vectorLayerGroupRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }
              }
            }
          }
        } else {
          newMapLayers[id] = mapLayers[id];
        }
      });
      // remember new layers
      onSetMapLayers(newMapLayers);
    }
  }, [layerIds, layerConfig, jsonLayers]);

  return (
    <Styled>
      <MapContainer id="ll-map" />
    </Styled>
  );
}

Map.propTypes = {
  layerConfig: PropTypes.array,
  layerIds: PropTypes.array,
  mapLayers: PropTypes.object,
  jsonLayers: PropTypes.object,
  onSetMapLayers: PropTypes.func,
  onLoadLayer: PropTypes.func,
  // locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  layers: state => selectLayers(state),
  layerConfig: state => selectLayerConfig(state),
  layerIds: state => selectActiveLayers(state),
  mapLayers: state => selectMapLayers(state),
  jsonLayers: state => selectLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onSetMapLayers: layers => {
      dispatch(setMapLayers(layers));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Map);
