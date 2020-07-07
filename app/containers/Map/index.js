/**
 *
 * Map
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { scalePow } from 'd3-scale';
import { uniq } from 'lodash/array';
// import bezierSpline from '@turf/bezier-spline';
// import { lineString } from '@turf/helpers';

import { MAPBOX, PROJECT_LOCATIONS, PROJECT_ICONS } from 'config';

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

const Tooltip = styled.div`
  position: relative;
  display: block;
  background: red;
  width: 200px;
  height: 100px;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  z-index: 3000;
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

const getPolylineLayer = ({ data, config }) => {
  const layer = L.featureGroup(null, { pane: 'vectorPane' });
  const options = {
    pane: 'vectorPane',
    ...config.style,
  };
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
          layer.addLayer(decorateLine(line, 'arrow', options));
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
          layer.addLayer(decorateLine(lineWest, 'arrow', options));
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
          layer.addLayer(decorateLine(lineEast, 'arrow', options));
          layer.addLayer(lineEast);
        } else {
          layer.addLayer(lineEast);
        }
      }
    }
  });
  return layer;
};

const getIcon = (feature, latlng, config) => {
  const { icon } = config;
  if (icon && icon.datauri) {
    const iconSize = [
      (icon.size && icon.size.x) || 25,
      (icon.size && icon.size.y) || 50,
    ];
    // off set from top left
    const iconAnchor =
      icon.align === 'center'
        ? [iconSize[0] / 2, iconSize[1] / 2] // center
        : [iconSize[0] / 2, iconSize[1]]; // bottom

    const options = {
      className: 'mpx-map-icon-uri',
      iconSize,
      iconAnchor,
    };
    // check for property dependent icon
    if (icon.property && typeof icon.datauri === 'object') {
      let uri = '';
      if (icon.multiple && icon.multiple === 'true') {
        const ps = icon.property.split('.');
        const propertyArray = feature.properties[ps[0]];
        const values = uniq(propertyArray.map(p => p[ps[1]]));
        uri =
          values.length > 1 ? icon.datauri.multiple : icon.datauri[values[0]];
      } else {
        const p = feature.properties[config.property];
        uri = icon.datauri[p] || icon.datauri.default;
      }
      return L.divIcon({
        ...options,
        html: `<img style="width:100%;" src="${uri}">`,
      });
    }
    // check for latitude flip
    if (icon.flip && icon.flip.latitude) {
      if (
        (icon.flip.latitude === 'south' && latlng.lat < 0) ||
        (icon.flip.latitude === 'north' && latlng.lat >= 0)
      ) {
        return L.divIcon({
          ...options,
          html: `<img style="transform:scale(1, -1);width:100%;" src="${
            icon.datauri
          }">`,
        });
      }
    }
    // icon normal state
    return L.divIcon({
      ...options,
      html: `<img style="width:100%;" src="${icon.datauri}">`,
    });
  }
  return L.icon();
};

const getPointLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null, { pane: 'vectorPane' });
  const options = {
    pane: 'vectorPane',
    ...config.style,
  };
  const events = {
    mouseover: args => markerEvents.mouseover(args, config),
    mouseout: args => markerEvents.mouseout(args, config),
    click: args => markerEvents.click(args, config),
  };
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) =>
      L.marker(latlng, {
        ...options,
        icon: getIcon(feature, latlng, config),
      }).on(events),
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
        L.marker([latlng.lat, latlng.lng - 360], {
          ...options,
          icon: getIcon(feature, latlng, config),
        }).on(events),
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
        L.marker([latlng.lat, latlng.lng + 360], {
          ...options,
          icon: getIcon(feature, latlng, config),
        }).on(events),
    });
    layer.addLayer(layerEast);
  }
  return layer;
};

const getCircleLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null, { pane: 'vectorPane' });
  const options = {
    pane: 'vectorPane',
    ...config.style,
  };
  const events = {
    mouseover: args => markerEvents.mouseover(args, config),
    mouseout: args => markerEvents.mouseout(args, config),
    click: args => markerEvents.click(args, config),
  };
  const range = getRange(data.features, config.render.attribute);
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        ...options,
        radius: scaleCircle(feature, range, config.render),
      }).on(events),
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
        }).on(events),
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
        }).on(events),
    });
    layer.addLayer(layerEast);
  }
  return layer;
};

const getVectorLayer = ({ jsonLayer, config, markerEvents }) => {
  const { data } = jsonLayer;
  // polyline
  if (config.render && config.render.type === 'polyline' && data.features) {
    return getPolylineLayer({ data, config });
  }

  // regular point marker
  if (config.render && config.render.type === 'marker') {
    return getPointLayer({ data, config, markerEvents });
  }
  // scaled circle marker
  if (config.render && config.render.type === 'scaledCircle') {
    return getCircleLayer({ data, config, markerEvents });
  }
  return null;
};

const getProjectLayer = ({ jsonLayer, project, markerEvents }) => {
  const { data, config } = jsonLayer;
  const events = {
    mouseover: args => markerEvents.mouseover(args, config),
    mouseout: args => markerEvents.mouseout(args, config),
    click: args => markerEvents.click(args, config),
  };
  const layer = L.featureGroup(null, { pane: 'vectorPane' });
  // prettier-ignore
  const icon =
    PROJECT_ICONS.icons && PROJECT_ICONS.icons.default
      ? L.divIcon({
        className: 'mpx-map-icon-uri',
        html: `<img style="width:100%;" src="${PROJECT_ICONS.icons.default}">`,
        iconSize: PROJECT_ICONS.size || [25, 50],
        iconAnchor: PROJECT_ICONS.anchor || [12.5, 50],
      })
      : L.icon();
  const options = {
    pane: 'vectorPane',
    icon,
    ...config.style,
  };
  const jsonLlayer = L.geoJSON(data, {
    filter: feature => filterByProject(feature, project),
    pointToLayer: (feature, latlng) => L.marker(latlng, options).on(events),
  });
  layer.addLayer(jsonLlayer);
  const layerBounds = jsonLlayer.getBounds();
  // duplicate layer to West if fit within bounds
  if (
    layerBounds.getWest() > MAP_OPTIONS.BOUNDS.W &&
    layerBounds.getWest() - 360 > MAP_OPTIONS.BOUNDS.W
  ) {
    const layerWest = L.geoJSON(data, {
      filter: feature => filterByProject(feature, project),
      pointToLayer: (feature, latlng) =>
        L.marker([latlng.lat, latlng.lng - 360], options).on(events),
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
        L.marker([latlng.lat, latlng.lng + 360], options).on(events),
    });
    layer.addLayer(layerEast);
  }
  return layer;
};

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
  const [tooltip, setTooltip] = useState(null);

  const mapRef = useRef(null);
  const basemapLayerGroupRef = useRef(null);
  const rasterLayerGroupRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);

  const onMarkerOver = (args, config) => {
    console.log('over', args, config);
    setTooltip(args.containerPoint);
  };
  const onMarkerOut = (args, config) => {
    console.log('out', args, config);
  };
  const onMarkerClick = (args, config) => {
    console.log('click', args, config);
    // setTooltip(args);
  };

  const markerEvents = {
    mouseover: onMarkerOver,
    mouseout: onMarkerOut,
    click: onMarkerClick,
  };

  console.log(tooltip && tooltip.x);

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
              const { config } = jsonLayers.projectLocations;
              const layer = getProjectLayer({
                jsonLayer: jsonLayers.projectLocations,
                project,
                markerEvents,
              });
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
                if (jsonLayers[id] && vectorLayerGroupRef) {
                  const layer = getVectorLayer({
                    jsonLayer: jsonLayers[id],
                    config,
                    markerEvents,
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
  }, [layerIds, layerConfig, jsonLayers, projects]);

  return (
    <Styled>
      <MapContainer id="ll-map">
        {tooltip && <Tooltip position={tooltip} />}
      </MapContainer>
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
