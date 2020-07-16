import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { scalePow } from 'd3-scale';
import { uniq } from 'lodash/array';
import quasiEquals from 'utils/quasi-equals';
// import bezierSpline from '@turf/bezier-spline';
// import { lineString } from '@turf/helpers';

import { PROJECT_CONFIG, MAP_OPTIONS } from 'config';

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
  quasiEquals(feature.properties.project_id, project.project_id);

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

export const getIcon = (icon, { feature, latlng, state = 'default' } = {}) => {
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

    let myClass = '';

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
        html: `<img style="width:100%" class="${myClass}" src="${uri}">`,
      });
    }
    if (icon.animate) {
      if (icon.animate.rotate) {
        if (icon.animate.rotate.right) {
          if (latlng && icon.animate.rotate.right.latitude) {
            if (
              (icon.animate.rotate.right.latitude === 'north' &&
                latlng.lat >= 0) ||
              (icon.animate.rotate.right.latitude === 'south' && latlng.lat < 0)
            ) {
              myClass = `${myClass} mpx-spin-right`;
            }
            if (
              (icon.animate.rotate.left.latitude === 'north' &&
                latlng.lat >= 0) ||
              (icon.animate.rotate.left.latitude === 'south' && latlng.lat < 0)
            ) {
              myClass = `${myClass} mpx-spin-left`;
            }
          }
        }
      }
    }
    // check for latitude flip
    if (latlng && icon.flip && icon.flip.latitude) {
      if (
        (icon.flip.latitude === 'south' && latlng.lat < 0) ||
        (icon.flip.latitude === 'north' && latlng.lat >= 0)
      ) {
        return L.divIcon({
          ...options,
          html: `<img style="transform:scale(1, -1);width:100%;" class="${myClass}" src="${iconForState}">`,
        });
      }
    }
    // icon normal state
    return L.divIcon({
      ...options,
      html: `<img style="width:100%;" class="${myClass}" src="${iconForState}">`,
    });
  }
  return L.icon();
};

const getPointLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null);
  const options = {
    ...config.style,
    zIndex: config['z-index'] || 1,
  };
  const events = {
    mouseover: e => markerEvents.mouseover(e, config),
    mouseout: e => markerEvents.mouseout(e, config),
    click: e => markerEvents.click(e, config),
  };
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) =>
      L.marker(latlng, {
        ...options,
        icon: getIcon(config.icon, { feature, latlng }),
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
        L.marker([latlng.lat, latlng.lng - 360], {
          ...options,
          copy: 'west',
          icon: getIcon(config.icon, { feature, latlng }),
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
        L.marker([latlng.lat, latlng.lng + 360], {
          ...options,
          copy: 'east',
          icon: getIcon(config.icon, { feature, latlng }),
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

export const getVectorLayer = ({ jsonLayer, config, markerEvents }) => {
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
    const divIcon = getIcon(icon);
    const options = {
      icon: divIcon,
      layer: project,
      layerId: `${PROJECT_CONFIG.id}-${
        project[PROJECT_CONFIG.data['layer-id']]
      }`,
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

export const getPropertyByLocale = (properties, element, locale) => {
  const props = element.propertyByLocale[locale].split('.');
  if (
    (element.multiple || element.multiple === 'true') &&
    element.multiple !== 'false' &&
    Array.isArray(properties[props[0]])
  ) {
    const multiProps = properties[props[0]];
    const otherProps = props.slice(1);
    return multiProps.map(mp =>
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
