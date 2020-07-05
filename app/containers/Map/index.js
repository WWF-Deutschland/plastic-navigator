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
import 'leaflet-polylinedecorator';
import { scalePow } from 'd3-scale';
// import bezierSpline from '@turf/bezier-spline';
// import { lineString } from '@turf/helpers';

import { MAPBOX, PROJECT_LOCATIONS } from 'config';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import quasiEquals from 'utils/quasi-equals';
// import commonMessages from 'messages';
//
// import messages from './messages';

import {
  selectActiveLayers,
  selectConfigByKey,
} from 'containers/App/selectors';
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

const coordinatesToLatLon = (coordinates, offsetLon = 0, bezier, reverse) => {
  if (coordinates && coordinates.length > 0) {
    const coords = reverse ? [...coordinates[0]].reverse() : coordinates[0];
    // if (bezier) {
    //   const bezierFeature = bezierSpline(lineString(coords), {
    //     resolution: 10000,
    //     sharpness: 0.95,
    //   });
    //   return bezierFeature.geometry.coordinates.map(coord =>
    //     coord.length === 2 ? [coord[1], coord[0] + offsetLon] : null,
    //   );
    // }
    return coords.map(coord =>
      coord.length === 2 ? [coord[1], coord[0] + offsetLon] : null,
    );
  }
  return [];
};

const decorateLine = (line, type, options) => {
  if (type === 'arrow') {
    return L.polylineDecorator(line, {
      patterns: [
        {
          repeat: 0,
          offset: 0,
          symbol: L.Symbol.arrowHead({
            pixelSize: 6,
            headAngle: 300,
            polygon: false,
            pathOptions: {
              stroke: true,
              weight: 1,
              color: options.color,
              opacity: 0.3,
            },
          }),
        },
      ],
    });
  }
  return line;
};

const filterByProject = (feature, project) =>
  quasiEquals(feature.properties.project_id, project.project_id);

const MAP_OPTIONS = {
  CENTER: [0, 180],
  ZOOM: {
    INIT: 2,
    MIN: 2,
    MAX: 7,
  },
  BOUNDS: {
    N: 85,
    W: -180,
    S: -85,
    E: 540,
  },
};

export function Map({
  layerConfig,
  layerIds,
  mapLayers,
  onSetMapLayers,
  onLoadLayer,
  jsonLayers,
  projects,
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
      center: MAP_OPTIONS.CENTER,
      zoom: MAP_OPTIONS.ZOOM.INIT,
      minZoom: MAP_OPTIONS.ZOOM.MIN,
      maxZoom: MAP_OPTIONS.ZOOM.MAX,
      maxBounds: [
        [MAP_OPTIONS.BOUNDS.N, MAP_OPTIONS.BOUNDS.W],
        [MAP_OPTIONS.BOUNDS.S, MAP_OPTIONS.BOUNDS.E],
      ],
    });
    mapRef.current.createPane('rasterPane');
    mapRef.current.getPane('rasterPane').style.zIndex = 200;
    mapRef.current.getPane('rasterPane').style.pointerEvents = 'none';
    mapRef.current.createPane('vectorPane');
    mapRef.current.getPane('vectorPane').style.zIndex = 300;
    basemapLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    rasterLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    vectorLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);

  // add basemap
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

  // update layers
  useEffect(() => {
    if (layerIds && layerConfig) {
      const newMapLayers = {};
      // remove layers no longer active
      Object.keys(mapLayers).forEach(id => {
        if (layerIds.indexOf(id) < 0) {
          const project =
            projects &&
            projects.find(p => p.project_id === id.replace('project-', ''));
          if (project && mapLayers[id]) {
            const { layer } = mapLayers[id];
            vectorLayerGroupRef.current.removeLayer(layer);
          } else {
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
        }
      });
      // add layers not already present
      layerIds.forEach(id => {
        // also check if map does not have layer,
        // otherwise they will not be adeded when hot reloading
        const llayer = mapLayers[id] && mapLayers[id].layer;
        const hasLayer =
          rasterLayerGroupRef.current.hasLayer(llayer) ||
          vectorLayerGroupRef.current.hasLayer(llayer);
        if (Object.keys(mapLayers).indexOf(id) < 0 || !hasLayer) {
          // check if this layer is a project
          const project =
            projects &&
            projects.find(p => p.project_id === id.replace('project-', ''));
          if (project) {
            if (!jsonLayers.projectLocations) {
              onLoadLayer('projectLocations', PROJECT_LOCATIONS);
            } else {
              const { data } = jsonLayers.projectLocations;
              const { config } = jsonLayers.projectLocations;
              const layer = L.featureGroup(null, { pane: 'vectorPane' });
              const options = {
                pane: 'vectorPane',
                ...config.style,
              };
              const jsonLayer = L.geoJSON(data, {
                filter: feature => filterByProject(feature, project),
                pointToLayer: (feature, latlng) => L.marker(latlng, options),
              });
              layer.addLayer(jsonLayer);
              const layerBounds = jsonLayer.getBounds();
              // duplicate layer to West if fit within bounds
              if (
                layerBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
                layerBounds.getWest() - 360 > MAP_OPTIONS.BOUNDS.W
              ) {
                const layerWest = L.geoJSON(data, {
                  filter: feature => filterByProject(feature, project),
                  pointToLayer: (feature, latlng) =>
                    L.marker([latlng.lat, latlng.lng - 360], options),
                });
                layer.addLayer(layerWest);
              }
              // // duplicate layer to East if fit within bounds
              if (
                layerBounds.getEast() < MAP_OPTIONS.BOUNDS.E &&
                layerBounds.getEast() + 360 < MAP_OPTIONS.BOUNDS.E
              ) {
                const layerEast = L.geoJSON(data, {
                  filter: feature => filterByProject(feature, project),
                  pointToLayer: (feature, latlng) =>
                    L.marker([latlng.lat, latlng.lng + 360], options),
                });
                layer.addLayer(layerEast);
              }
              vectorLayerGroupRef.current.addLayer(layer);
              newMapLayers[id] = { layer, config };
            }
          } else {
            const config = layerConfig.find(c => c.id === id);
            if (config) {
              // raster layer
              if (
                config.type === 'raster-tiles' &&
                config.source === 'mapbox'
              ) {
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
              // geojson layer
              if (config.type === 'geojson' && config.source === 'data') {
                // kick of loading of vector data for group if not present
                if (!jsonLayers[id]) {
                  onLoadLayer(id, config);
                }
                const options = {
                  pane: 'vectorPane',
                  ...config.style,
                };
                if (jsonLayers[id] && vectorLayerGroupRef) {
                  const { data } = jsonLayers[id];
                  const layer = L.featureGroup(null, { pane: 'vectorPane' });
                  // polyline
                  if (
                    config.render &&
                    config.render.type === 'polyline' &&
                    data.features
                  ) {
                    data.features.forEach(feature => {
                      if (feature.geometry && feature.geometry.coordinates) {
                        const line = L.polyline(
                          coordinatesToLatLon(
                            feature.geometry.coordinates,
                            0,
                            config.render.bezier === 'true',
                            config.render.decorate === 'arrow',
                          ),
                          options,
                        );
                        const lineBounds = line.getBounds();
                        // make sure we are within map bounds
                        if (
                          lineBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
                          lineBounds.getEast() < MAP_OPTIONS.BOUNDS.E
                        ) {
                          if (config.render.decorate === 'arrow') {
                            layer.addLayer(
                              decorateLine(line, 'arrow', options),
                            );
                            layer.addLayer(line);
                          } else {
                            layer.addLayer(line);
                          }
                        }
                        // duplicate layer to West if fit within bounds
                        if (
                          lineBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
                          lineBounds.getWest() - 360 > MAP_OPTIONS.BOUNDS.W
                        ) {
                          const lineWest = L.polyline(
                            coordinatesToLatLon(
                              feature.geometry.coordinates,
                              360,
                              config.render.bezier === 'true',
                              config.render.decorate === 'arrow',
                            ),
                            options,
                          );
                          if (config.render.decorate === 'arrow') {
                            layer.addLayer(
                              decorateLine(lineWest, 'arrow', options),
                            );
                            layer.addLayer(lineWest);
                          } else {
                            layer.addLayer(lineWest);
                          }
                        }
                        // duplicate layer to East if fit within bounds
                        if (
                          lineBounds.getEast() < MAP_OPTIONS.BOUNDS.E &&
                          lineBounds.getEast() + 360 < MAP_OPTIONS.BOUNDS.E
                        ) {
                          const lineEast = L.polyline(
                            coordinatesToLatLon(
                              feature.geometry.coordinates,
                              360,
                              config.render.bezier === 'true',
                              config.render.decorate === 'arrow',
                            ),
                            options,
                          );
                          if (config.render.decorate === 'arrow') {
                            layer.addLayer(
                              decorateLine(lineEast, 'arrow', options),
                            );
                            layer.addLayer(lineEast);
                          } else {
                            layer.addLayer(lineEast);
                          }
                        }
                      }
                    });
                    vectorLayerGroupRef.current.addLayer(layer);
                    newMapLayers[id] = { layer, config };
                  }

                  // regular point marker
                  if (config.render && config.render.type === 'marker') {
                    const jsonLayer = L.geoJSON(data, {
                      pointToLayer: (feature, latlng) =>
                        L.marker(latlng, options),
                    });
                    layer.addLayer(jsonLayer);
                    const layerBounds = jsonLayer.getBounds();
                    // duplicate layer to West if fit within bounds
                    if (
                      layerBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
                      layerBounds.getWest() - 360 > MAP_OPTIONS.BOUNDS.W
                    ) {
                      const layerWest = L.geoJSON(data, {
                        pointToLayer: (feature, latlng) =>
                          L.marker([latlng.lat, latlng.lng - 360], options),
                      });
                      layer.addLayer(layerWest);
                    }
                    // // duplicate layer to East if fit within bounds
                    if (
                      layerBounds.getEast() < MAP_OPTIONS.BOUNDS.E &&
                      layerBounds.getEast() + 360 < MAP_OPTIONS.BOUNDS.E
                    ) {
                      const layerEast = L.geoJSON(data, {
                        pointToLayer: (feature, latlng) =>
                          L.marker([latlng.lat, latlng.lng + 360], options),
                      });
                      layer.addLayer(layerEast);
                    }
                    vectorLayerGroupRef.current.addLayer(layer);
                    newMapLayers[id] = { layer, config };
                  }
                  // scaled circle marker
                  if (config.render && config.render.type === 'scaledCircle') {
                    const range = getRange(
                      data.features,
                      config.render.attribute,
                    );
                    const jsonLayer = L.geoJSON(data, {
                      pointToLayer: (feature, latlng) =>
                        L.circleMarker(latlng, {
                          ...options,
                          radius: scaleCircle(feature, range, config.render),
                        }),
                    });
                    layer.addLayer(jsonLayer);
                    const layerBounds = jsonLayer.getBounds();
                    // duplicate layer to West if fit within bounds
                    if (
                      layerBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
                      layerBounds.getWest() - 360 > MAP_OPTIONS.BOUNDS.W
                    ) {
                      const layerWest = L.geoJSON(data, {
                        pointToLayer: (feature, latlng) =>
                          L.circleMarker([latlng.lat, latlng.lng - 360], {
                            ...options,
                            radius: scaleCircle(feature, range, config.render),
                          }),
                      });
                      layer.addLayer(layerWest);
                    }
                    // // duplicate layer to East if fit within bounds
                    if (
                      layerBounds.getEast() < MAP_OPTIONS.BOUNDS.E &&
                      layerBounds.getEast() + 360 < MAP_OPTIONS.BOUNDS.E
                    ) {
                      const layerEast = L.geoJSON(data, {
                        pointToLayer: (feature, latlng) =>
                          L.circleMarker([latlng.lat, latlng.lng + 360], {
                            ...options,
                            radius: scaleCircle(feature, range, config.render),
                          }),
                      });
                      layer.addLayer(layerEast);
                    }
                    vectorLayerGroupRef.current.addLayer(layer);
                    newMapLayers[id] = { layer, config };
                  }
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
  }, [layerIds, layerConfig, jsonLayers, projects]);

  return (
    <Styled>
      <MapContainer id="ll-map" />
    </Styled>
  );
}

Map.propTypes = {
  layerConfig: PropTypes.array,
  projects: PropTypes.array,
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
  projects: state => selectConfigByKey(state, { key: 'projects' }),
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
