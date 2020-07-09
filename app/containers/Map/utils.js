import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { scalePow } from 'd3-scale';
import { uniq } from 'lodash/array';
import quasiEquals from 'utils/quasi-equals';
// import bezierSpline from '@turf/bezier-spline';
// import { lineString } from '@turf/helpers';

import { PROJECT_CONFIG, MAP_OPTIONS } from 'config';

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
    mouseover: args => markerEvents.mouseover(args, config),
    mouseout: args => markerEvents.mouseout(args, config),
    click: args => markerEvents.click(args, config),
  };
  const layer = L.featureGroup(null, { pane: 'vectorPane' });
  const { icon } = PROJECT_CONFIG;
  if (icon && icon.datauri) {
    const iconSize = [
      (icon.size && icon.size.x) || 25,
      (icon.size && icon.size.y) || 50,
    ];
    const iconAnchor =
      icon.align === 'center'
        ? [iconSize[0] / 2, iconSize[1] / 2] // center
        : [iconSize[0] / 2, iconSize[1]]; // bottom
    // prettier-ignore
    const divIcon = L.divIcon({
      className: 'mpx-map-icon-uri',
      html: `<img style="width:100%;" src="${icon.datauri.default}">`,
      iconSize,
      iconAnchor,
    })
    const options = {
      pane: 'vectorPane',
      icon: divIcon,
      layer: project,
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
