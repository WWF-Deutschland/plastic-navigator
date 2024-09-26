import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { scalePow } from 'd3-scale';
import { uniq, intersection } from 'lodash/array';
import qe from 'utils/quasi-equals';
import { getCountryPositionForAnyTopicAndDate } from 'utils/policy';
import { formatMessageForValues } from 'utils/string';
import { excludeCountryFeatures } from 'containers/LayerInfo/policy/utils';
// import bezierSpline from '@turf/bezier-spline';
// import { lineString } from '@turf/helpers';
import 'leaflet.vectorgrid';

import { PROJECT_CONFIG, MAP_OPTIONS } from 'config';
import { DEFAULT_LOCALE } from 'i18n';

export const getRange = (allFeatures, attribute) =>
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

const getFloatProperty = (feature, config) =>
  feature.properties && parseFloat(feature.properties[config.attribute]);

export const scaleCircle = (val, range, config) => {
  const scale = scalePow()
    .exponent(config.exp || 0.5)
    .domain([0, range.max])
    .range([0, config.max]);
  return Math.max(config.min, scale(val));
};

export const valueOfCircle = (radius, range, config) => {
  const scale = scalePow()
    .exponent(1 / config.exp || 2)
    .domain([0, config.max])
    .range([0, range.max]);
  return scale(radius);
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
  qe(feature.properties.project_id, project.project_id);

const getPolylineLayer = ({ data, config }) => {
  const layer = L.featureGroup(null);
  const options = {
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
          {
            ...options,
            copy: 'east',
          },
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
          {
            ...options,
            copy: 'east',
          },
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
export const getVectorGridStyle = (
  properties,
  dataConfig,
  config,
  state = 'default',
) => {
  // const value = properties[GEOJSON.PROPERTIES.OCCURRENCE];
  if (state === 'mask') {
    return {
      fillColor: '000',
      fill: true,
      fillOpacity: 0,
      stroke: false,
      weight: 0,
      className: 'leaflet-mask',
    };
  }
  let featureStyle = {
    fillOpacity: 0,
    stroke: false,
  };
  if (properties && properties.indicator) {
    if (
      dataConfig &&
      dataConfig['styles-by-value'] &&
      dataConfig['styles-by-value'] !== 'inherit'
    ) {
      const value = properties.indicator.value || 0;
      featureStyle = {
        ...featureStyle,
        stroke: true,
        ...dataConfig['styles-by-value'][value],
      };
    } else if (
      dataConfig &&
      dataConfig['styles-by-value'] &&
      dataConfig['styles-by-value'] === 'inherit' &&
      config &&
      config['styles-by-value']
    ) {
      const value = properties.indicator.value || 0;
      featureStyle = {
        ...featureStyle,
        stroke: true,
        ...config['styles-by-value'][value],
      };
    }
  }
  // console.log('config', config)
  if (state === 'hover') {
    featureStyle.fillOpacity = 0.2;
  } else if (state === 'active') {
    featureStyle.fillOpacity = 0;
    featureStyle.stroke = false;
  } else if (state === 'info') {
    featureStyle.fillOpacity = 0;
    featureStyle.stroke = false;
  }
  return {
    weight: 1,
    fill: true,
    ...featureStyle,
  };
};
const featureInteractive = (e, config) => {
  // console.log('featureInteractive config', config)
  if (config.indicators && e.layer) {
    const { properties } = e.layer;
    return properties && properties.indicator;
  }
  if (
    e.layer &&
    config.tooltip &&
    config.tooltip.values &&
    config.featureStyle.multiple &&
    config.featureStyle.multiple === 'true'
  ) {
    // figure out feature values
    const ps = config.featureStyle.property.split('.');
    const { properties } = e.layer;
    const propertyArray = properties && properties[ps[0]];
    const values = propertyArray && uniq(propertyArray.map(p => p[ps[1]]));
    return intersection(config.tooltip.values, values).length > 0;
  }
  return false;
};

const getPolygonVectorGrid = ({ data, config, markerEvents, state }) => {
  const vectorGrid = L.vectorGrid.slicer(data, {
    data,
    zIndex:
      state === 'mask' && config['z-index']
        ? parseInt(config['z-index'], 10) + 1
        : config['z-index'] || 1,
    rendererFactory: L.svg.tile,
    vectorTileLayerStyles: {
      sliced: properties =>
        getVectorGridStyle(properties, data.config, config, state),
    },
    interactive: state !== 'hover' && state !== 'active',
    getFeatureId: f => f.properties.f_id,
  });
  if (state === 'mask') {
    vectorGrid.on({
      click: () => null,
    });
  } else if (markerEvents) {
    vectorGrid.on({
      mouseover: e => {
        if (featureInteractive(e, config) && markerEvents.mouseover) {
          markerEvents.mouseover(e, config);
        }
        return null;
      },
      mouseout: e => {
        if (featureInteractive(e, config) && markerEvents.mouseout) {
          markerEvents.mouseout(e, config);
        }
        return null;
      },
      click: e => {
        if (featureInteractive(e, config) && markerEvents.click) {
          return markerEvents.click(e, config);
        }
        return null;
      },
    });
  }
  return vectorGrid;
};

const getBestValue = (multiplePriority, properties, path) => {
  const propertyArray = properties[path[0]];
  const values = propertyArray && uniq(propertyArray.map(p => p[path[1]]));
  return multiplePriority.reduce((memo, pvalue) => {
    if (memo) return memo;
    return values.find(val => val === pvalue);
  }, null);
};

const getPolygonLayer = ({ data, config, markerEvents, state }) => {
  const layer = L.featureGroup(null, { pane: 'overlayPane' });
  let dataSorted;
  if (
    state !== 'mask' &&
    config &&
    config.featureStyle &&
    config.featureStyle.multiplePriority
  ) {
    const path = config.featureStyle.property.split('.');
    const dataFeatures = [...data.features].sort((f1, f2) => {
      const bestValue1 = getBestValue(
        config.featureStyle.multiplePriority,
        f1.properties,
        path,
      );
      const bestValue2 = getBestValue(
        config.featureStyle.multiplePriority,
        f2.properties,
        path,
      );
      return bestValue1 > bestValue2 ? 1 : -1;
    });
    dataSorted = {
      ...data,
      features: dataFeatures,
    };
  }
  const vectorGrid = getPolygonVectorGrid({
    data: dataSorted || data,
    config,
    markerEvents,
    state,
  });
  layer.addLayer(vectorGrid);
  return layer;
};

export const getIcon = (
  config,
  { feature, latlng, state = 'default', hide } = {},
) => {
  const { icon } = config;
  if (hide) {
    return L.divIcon({
      className: 'mpx-map-icon-uri',
      iconSize: [0, 0],
      html: '<img style="width:100%;" src="">',
    });
  }
  if (icon && icon.datauri) {
    const sizeForState = icon.size[state] || icon.size.default || icon.size;
    const iconSize = [
      (sizeForState && sizeForState.x) || 25,
      (sizeForState && sizeForState.y) || 50,
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
    const iconForState =
      state === 'hover'
        ? icon.datauri.hover ||
          icon.datauri['semi-active'] ||
          icon.datauri.default ||
          icon.datauri
        : icon.datauri[state] || icon.datauri.default || icon.datauri;
    if (feature && icon.property && typeof icon.datauri === 'object') {
      let uri = '';
      if (icon.multiple && icon.multiple === 'true') {
        const ps = icon.property.split('.');
        const propertyArray = feature.properties[ps[0]];
        const values = uniq(propertyArray.map(p => p[ps[1]]));
        if (icon.multiplePriority) {
          uri = icon.multiplePriority.reduce((memo, value) => {
            if (memo) return memo;
            if (values.indexOf(value) > -1) {
              return iconForState[value];
            }
            return null;
          }, null);
        } else {
          uri =
            values.length > 1 ? iconForState.multiple : iconForState[values[0]];
        }
      } else {
        const p = feature.properties[icon.property];
        uri = iconForState[p] || iconForState.default;
      }
      return L.divIcon({
        ...options,
        html: `<img style="width:100%;" src="${uri}">`,
      });
    }
    // check for latitude flip
    if (latlng && icon.flip && icon.flip.latitude) {
      if (
        (icon.flip.latitude === 'south' && latlng.lat < 0) ||
        (icon.flip.latitude === 'north' && latlng.lat >= 0)
      ) {
        return L.divIcon({
          ...options,
          html: `<img style="transform:scale(-1, 1);width:100%;" src="${iconForState}">`,
        });
      }
    }
    // icon normal state
    return L.divIcon({
      ...options,
      html: `<img style="width:100%;" src="${iconForState}">`,
    });
  }
  const iconsByValue = config['icons-by-value'];
  if (iconsByValue && config.size) {
    // console.log('feature',feature)
    // const sizeForState =
    //   config.size[state] || config.size.default || config.size;
    const iconSize = [
      // (sizeForState && sizeForState.x) || 25,
      // (sizeForState && sizeForState.y) || 50,
      24,
      25.5,
    ];
    // off set from top left
    const iconAnchor = [iconSize[0] / 2, iconSize[1]]; // bottom
    const options = {
      className: 'mpx-map-icon-uri',
      iconSize,
      iconAnchor,
    };
    const value =
      (feature &&
        feature.properties &&
        feature.properties.indicator &&
        feature.properties.indicator.value) ||
      0;

    // check for property dependent icon
    if (iconsByValue[value]) {
      const uri = iconsByValue[value][state];
      // console.log('uri', uri)
      return L.divIcon({
        ...options,
        html: `<img style="width:100%;" src="${uri}">`,
      });
    }
    return L.divIcon({
      ...options,
      iconSize: [0, 0],
      html: '<img style="width:100%;" src="">',
    });
  }
  return L.icon();
};

const filterFeatureMaxZoom = ({ feature, zoom, config }) => {
  if (
    config &&
    config['default-max-zoom'] &&
    feature.properties[config['default-max-zoom']] &&
    feature.properties[config['default-max-zoom']] !== ''
  ) {
    return zoom <= parseInt(feature.properties[config['default-max-zoom']], 10);
  }
  return false;
};

const getPointLayer = ({ data, config, markerEvents, layerGeoSettings }) => {
  const layer = L.featureGroup(null);
  const options = {
    ...config.style,
    zIndex: config['z-index'] || 1,
  };
  const hasZoomCheck =
    config['default-max-zoom'] && config.settings && config.settings.zoom;
  let doZoomCheck = hasZoomCheck;
  if (doZoomCheck) {
    doZoomCheck = config.settings.zoom.default;
  }
  if (doZoomCheck && layerGeoSettings.zoom) {
    doZoomCheck =
      qe(layerGeoSettings.zoom, 1) || layerGeoSettings.zoom === 'true';
  }
  const events = {
    mouseover: e =>
      markerEvents.mouseover ? markerEvents.mouseover(e, config) : null,
    mouseout: e =>
      markerEvents.mouseout ? markerEvents.mouseout(e, config) : null,
    click: e => (markerEvents.click ? markerEvents.click(e, config) : null),
  };
  // prettier-ignore
  const jsonLayer = L.geoJSON(data, {
    config,
    checkZoom: doZoomCheck
      ? (feature, zoom) => filterFeatureMaxZoom({ feature, zoom, config})
      : null,
    pointToLayer: (feature, latlng) =>
      L.marker(latlng, {
        ...options,
        icon: getIcon(config, { feature, latlng }),
        opacity: config['default-max-zoom'] ? 0.666 : 1,
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
      copy: 'west',
      config,
      checkZoom: doZoomCheck
        ? (feature, zoom) => filterFeatureMaxZoom({ feature, zoom, config })
        : null,
      pointToLayer: (feature, latlng) =>
        L.marker([latlng.lat, latlng.lng - 360], {
          ...options,
          copy: 'west',
          icon: getIcon(config, { feature, latlng }),
          opacity: config['default-max-zoom'] ? 0.666 : 1,
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
      copy: 'east',
      config,
      checkZoom: doZoomCheck
        ? (feature, zoom) => filterFeatureMaxZoom({ feature, zoom, config })
        : null,
      pointToLayer: (feature, latlng) =>
        L.marker([latlng.lat, latlng.lng + 360], {
          ...options,
          copy: 'east',
          icon: getIcon(config, { feature, latlng }),
          opacity: config['default-max-zoom'] ? 0.666 : 1,
        }).on(events),
    });
    layer.addLayer(layerEast);
  }
  return layer;
};

const getCircleLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null, { pane: 'overlayPane' });
  const options = {
    pane: 'overlayPane',
    ...config.style,
    zIndex: config['z-index'] || 1,
  };
  const events = {
    mouseover: e => markerEvents.mouseover(e, config),
    mouseout: e => markerEvents.mouseout(e, config),
    click: e => markerEvents.click(e, config),
  };
  const range = getRange(data.features, config.render.attribute);
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        ...options,
        radius: scaleCircle(
          getFloatProperty(feature, config.render),
          range,
          config.render,
        ),
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
      copy: 'west',
      pointToLayer: (feature, latlng) =>
        L.circleMarker([latlng.lat, latlng.lng - 360], {
          ...options,
          copy: 'west',
          radius: scaleCircle(
            getFloatProperty(feature, config.render),
            range,
            config.render,
          ),
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
      copy: 'east',
      pointToLayer: (feature, latlng) =>
        L.circleMarker([latlng.lat, latlng.lng + 360], {
          ...options,
          copy: 'east',
          radius: scaleCircle(
            getFloatProperty(feature, config.render),
            range,
            config.render,
          ),
        }).on(events),
    });
    layer.addLayer(layerEast);
  }
  return layer;
};

const prepareGeometry = ({
  config,
  geometry,
  features,
  tables,
  indicatorId,
  dateString,
  locale,
  intl,
}) => {
  const topic =
    tables &&
    tables.topics &&
    tables.topics.data &&
    tables.topics.data.data &&
    tables.topics.data.data.find(t => qe(t.id, indicatorId));
  if (config.indicators) {
    const geometryX = {
      type: geometry.type,
      config: geometry.config,
      features: geometry.features.map(gf => {
        const feature = features.find(f =>
          qe(f[config.self], gf.properties[geometry.config.feature]),
        );
        // console.log('gf', gf)
        // console.log('feature', feature)?
        if (feature) {
          const position = getCountryPositionForAnyTopicAndDate({
            countryCode: feature.code,
            topic,
            dateString,
            tables,
            locale,
          });
          let positionTitle = '';
          if (position && position.latestPosition) {
            // prettier-ignore
            positionTitle = intl ?
              formatMessageForValues({
                intl,
                message:
                  position.latestPosition[`position_short_${locale}`] ||
                  position.latestPosition[`position_short_${DEFAULT_LOCALE}`],
                values: { isSingle: false },
              })
              : position.latestPosition[`position_short_${locale}`] ||
                position.latestPosition[`position_short_${DEFAULT_LOCALE}`];
          }
          return {
            type: gf.type,
            geometry: gf.geometry,
            properties: {
              ...gf.properties,
              ...feature,
              indicator: position,
              tooltip: {
                supTitle: position ? position.topic : 'no topic',
                title:
                  gf.properties[`name_${locale}`] ||
                  gf.properties[`name_${DEFAULT_LOCALE}`],
                infoArg: 'item',
                infoPath: `${config.id}_${indicatorId}|country-${feature.code}`,
                id: feature.code,
                more: true,
                content: positionTitle,
              },
            },
          };
        }
        return gf;
      }),
    };
    return geometryX;
  }
  return geometry;
};

const getLayerGeoSettings = (layerSettings, index) =>
  layerSettings.reduce((memo, setting) => {
    const [geoIndex, keyValue] = setting.split('-');
    if (`g${index}` === geoIndex) {
      const [key, value] = keyValue.split(':');
      return {
        ...memo,
        [key]: value,
      };
    }
    return memo;
  }, {});

export const getVectorLayer = ({
  jsonLayer,
  config,
  markerEvents,
  state,
  indicatorId,
  dateString,
  locale,
  layerGeometrySettings,
  intl,
}) => {
  const { data } = jsonLayer;
  // polyline
  if (config.render && config.render.type === 'polyline' && data.features) {
    return getPolylineLayer({ data, config, state });
  }
  // polygon
  if (config.render && config.render.type === 'area' && data.features) {
    return getPolygonLayer({ data, config, markerEvents, state });
  }

  // regular point marker
  if (config.render && config.render.type === 'marker') {
    return getPointLayer({
      data: {
        features: data.features
          ? excludeCountryFeatures(config, data.features)
          : [],
      },
      config,
      markerEvents,
      state,
    });
  }
  // scaled circle marker
  if (config.render && config.render.type === 'scaledCircle') {
    return getCircleLayer({ data, config, markerEvents, state });
  }
  let layers;
  if (data.features && data.geometries && data.geometries.length > 0) {
    // figure out any settings for current layer
    const layerSettings = layerGeometrySettings.reduce((memo, lg) => {
      const [layerId, rest] = lg.split('_');
      if (config.id === layerId) {
        return [...memo, rest];
      }
      return memo;
    }, []);
    // cons/t geometry = data.geometries[0]; // for now take first one
    layers = data.geometries.reduce((memoLayers, geometry, index) => {
      const geometryX = prepareGeometry({
        geometry,
        config,
        features: data.features,
        tables: data.tables,
        indicatorId,
        dateString,
        locale,
        intl,
      });
      const layerGeoSettings = getLayerGeoSettings(layerSettings, index);
      let active = true;
      if (
        geometry.config.settings &&
        geometry.config.settings.active &&
        geometry.config.settings.active.default
      ) {
        active = geometry.config.settings.active.default;
      }
      if (layerGeoSettings && typeof layerGeoSettings.active !== 'undefined') {
        active =
          qe(layerGeoSettings.active, 1) || layerGeoSettings.active === 'true';
      }
      if (active) {
        if (geometry.config.render.type === 'area') {
          return [
            ...memoLayers,
            getPolygonLayer({
              data: geometryX,
              config,
              markerEvents,
              state,
            }),
          ];
        }
        if (geometry.config.render.type === 'marker') {
          return [
            ...memoLayers,
            getPointLayer({
              data: geometryX,
              config: geometry.config,
              markerEvents,
              state,
              layerGeoSettings,
            }),
          ];
        }
      }
      return memoLayers;
    }, []);
    if (
      layers.length > 0 &&
      data.features &&
      data.geometryMasks &&
      data.geometryMasks.length > 0
    ) {
      const maskLayers = data.geometryMasks.map(geometry => {
        if (geometry.config.render.type === 'area') {
          return getPolygonLayer({
            data: geometry,
            config,
            state: 'mask',
          });
        }
        return null;
      });
      layers = [...layers, ...maskLayers];
    }
  }
  return layers ? L.layerGroup(layers) : null;
};
const getProjectData = ({ data, project }) => {
  const projectFeatures = data.features.filter(feature =>
    filterByProject(feature, project),
  );
  return {
    ...data,
    features: projectFeatures.map(feature => {
      let infoArg = 'info';
      let infoPath = `${PROJECT_CONFIG.id}_${project.project_id}`;
      if (projectFeatures.length > 1) {
        infoArg = 'item';
        // item=projects_7|location-7.1
        infoPath = `${infoPath}|location-${feature.properties.location_id}`;
      }
      return {
        ...feature,
        infoArg,
        infoPath,
      };
    }),
  };
};

export const getProjectLayer = ({ jsonLayer, project, markerEvents }) => {
  const { data, config } = jsonLayer;
  const events = {
    mouseover: e => markerEvents.mouseover(e, config),
    mouseout: e => markerEvents.mouseout(e, config),
    click: e => markerEvents.click(e, config),
  };
  const layer = L.featureGroup(null);
  const { icon } = PROJECT_CONFIG;
  if (icon && icon.datauri) {
    const divIcon = getIcon(PROJECT_CONFIG);
    const options = {
      icon: divIcon,
      layer: project,
      layerId: `${PROJECT_CONFIG.id}_${
        project[PROJECT_CONFIG.data['layer-id']]
      }`,
      ...config.style,
    };
    const dataX = getProjectData({ data, project });
    const jsonLlayer = L.geoJSON(dataX, {
      // filter: feature => filterByProject(feature, project),
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
          L.marker([latlng.lat, latlng.lng - 360], {
            ...options,
            copy: 'west',
          }).on(events),
        copy: 'west',
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
          L.marker([latlng.lat, latlng.lng + 360], {
            ...options,
            copy: 'east',
          }).on(events),
        copy: 'east',
      });
      layer.addLayer(layerEast);
    }
  }
  return layer;
};

export const getPropertyByLocale = (
  properties,
  element,
  locale,
  // multiHint = 'test',
) => {
  const props = element.propertyByLocale[locale].split('.');
  if (
    (element.multiple || element.multiple === 'true') &&
    element.multiple !== 'false' &&
    Array.isArray(properties[props[0]])
  ) {
    const attributes = properties[props[0]];
    const otherProps = props.slice(1);
    if (element.multiplePriority && element.property) {
      const ps = element.property.split('.');
      const propertyArray = properties[ps[0]];
      const values = propertyArray && uniq(propertyArray.map(p => p[ps[1]]));
      // console.log(ps, propertyArray, values)
      // console.log(
      //   attributes.map(mp =>
      //     otherProps.reduce((memo, prop) => memo[prop], mp),
      //   )
      // )
      const bestValue = element.multiplePriority.reduce((memo, pvalue) => {
        if (memo) return memo;
        return values.find(val => val === pvalue);
      }, null);
      const bestAttr = propertyArray.find(attr => attr[ps[1]] === bestValue);
      // console.log(bestValue, bestAttr, otherProps)
      const bestProperty = otherProps.reduce(
        (memo, prop) => memo[prop],
        bestAttr,
      );
      // return values.length > 1 ? `${bestProperty} ${multiHint}` : bestProperty;
      return bestProperty;
    }
    return attributes.map(mp =>
      otherProps.reduce((memo, prop) => memo[prop], mp),
    );
  }
  return props.reduce((memo, prop) => memo[prop], properties);
};

export const padBounds = (latlngBounds, padding, map) => {
  const { n, e, s, w } = padding;
  const ne = latlngBounds.getNorthEast();
  const sw = latlngBounds.getSouthWest();
  const nePoint = map.project(ne);
  const swPoint = map.project(sw);
  return L.latLngBounds(
    map.unproject(L.point(nePoint.x - e, nePoint.y + n)),
    map.unproject(L.point(swPoint.x + w, swPoint.y - s)),
  );
};
export const getMapPaddedBounds = (map, padding) => {
  const bounds = map.getBounds();
  return padBounds(bounds, padding, map);
};

export const hideForZoom = ({ layer, zoom }) => {
  if (layer && layer.getLayers() && layer.getLayers().length > 0) {
    layer.eachLayer(sublayer => {
      if (sublayer.getLayers && sublayer.getLayers().length > 0) {
        if (sublayer.options && sublayer.options.checkZoom) {
          sublayer.eachLayer(feature => {
            if (sublayer.options.checkZoom(feature.feature, zoom)) {
              feature.setIcon(
                getIcon(sublayer.options.config, { feature: feature.feature }),
              );
            } else {
              feature.setIcon(getIcon(sublayer.options.config, { hide: true }));
            }
          });
        } else {
          sublayer.eachLayer(sublayer2 => {
            if (sublayer2.getLayers && sublayer2.getLayers().length > 0) {
              if (sublayer2.options && sublayer2.options.checkZoom) {
                sublayer2.eachLayer(feature => {
                  if (sublayer2.options.checkZoom(feature.feature, zoom)) {
                    feature.setIcon(
                      getIcon(sublayer2.options.config, {
                        feature: feature.feature,
                      }),
                    );
                  } else {
                    feature.setIcon(
                      getIcon(sublayer2.options.config, { hide: true }),
                    );
                  }
                });
              }
            }
          });
        }
      }
    });
  }
};
