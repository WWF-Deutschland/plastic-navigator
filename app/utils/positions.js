import asArray from 'utils/as-array';
import quasiEquals from 'utils/quasi-equals';
import { DEFAULT_LOCALE } from 'i18n';

export const sortPositions = (positions, config) =>
  asArray(positions)
    .slice()
    .sort((a, b) => {
      const aDate = a.source && a.source.date && new Date(a.source.date);
      const bDate = b.source && b.source.date && new Date(b.source.date);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      if (aDate > bDate) return -1;
      return 1;
    })
    .sort((a, b) => {
      // area layer
      if (config.key && config.key.values) {
        const aIndex =
          a.position_id && config.key.values.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.values.indexOf(b.position_id);
        if (aIndex < bIndex) return -1;
        return 1;
      }
      // point layer
      if (config.key && config.key.iconValue && config.key.iconValue.full) {
        const aIndex =
          a.position_id && config.key.iconValue.full.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.iconValue.full.indexOf(b.position_id);
        if (aIndex < bIndex) return -1;
        return 1;
      }
      return 1;
    });

export const getStrongestPosition = (positions, config) => {
  if (!positions || positions.length < 1) return null;
  const sorted = sortPositions(positions, config);
  return sorted[0];
};

export const getPositionIcon = (position, config) => {
  if (config.icon && config.icon.datauri) {
    const iconuri = config.icon.datauri.default || config.icon.datauri;
    return iconuri ? iconuri[position.position_id] : null;
  }
  return null;
};

export const getPositionSquareStyle = (positionOrValue, config) => {
  let positionStyle;
  let positionProperty;
  if (config.featureStyle) {
    positionProperty = config.featureStyle.property;
    positionStyle = config.featureStyle.style;
  } else if (config.key && config.key.style) {
    positionProperty = config.key.style.property;
    positionStyle = config.key.style;
  }
  const ps = positionProperty && positionProperty.split('.');
  const positionValue =
    (ps && ps[1] && positionOrValue[ps[1]]) || positionOrValue;
  if (positionStyle) {
    const style = Object.keys(positionStyle).reduce((styleMemo, attr) => {
      if (attr === 'type' || attr === 'property') return styleMemo;
      const attrObject = positionStyle[attr];
      // prettier-ignore
      const attrValue =
        attrObject[positionValue] ||
        attrObject.default ||
        attrObject.none ||
        attrObject.without ||
        attrObject['0'];
      return {
        ...styleMemo,
        [attr]: attrValue,
      };
    }, {});
    return {
      stroke: config.render && config.render.type === 'area',
      weight: config.render && config.render.type === 'area' ? 1 : 0,
      fill: true,
      fillOpacity: config.render && config.render.type === 'area' ? 0.4 : 1,
      ...style,
    };
  }
  return null;
};
export const getPositionCircleStyle = (positionOrValue, config) => {
  const { key, render, icon } = config;
  const isIcon =
    (key && key.icon && !!key.icon.datauri) ||
    (render && render.type === 'marker' && !!icon.datauri);
  const isIconAlt = isIcon && key.style && key.style.type === 'circle';
  if (isIconAlt) {
    const positionStyle = key.style;
    const positionProperty = config.key.style.property;
    const ps = positionProperty && positionProperty.split('.');
    const positionValue =
      (ps && ps[1] && positionOrValue[ps[1]]) || positionOrValue;
    const style = Object.keys(positionStyle).reduce(
      (styleMemo, attr) => {
        if (attr === 'type' || attr === 'property') return styleMemo;
        const attrObject = positionStyle[attr];
        // prettier-ignore
        const attrValue =
          attrObject[positionValue] ||
          attrObject.default ||
          attrObject.none ||
          attrObject.without ||
          attrObject['0'];
        return {
          ...styleMemo,
          [attr]: attrValue,
        };
      },
      {
        weight: '0',
        fillOpacity: 1,
      },
    );
    return {
      style,
    };
  }
  return null;
};

export const getPositionLabel = (position, locale) =>
  (locale && position[`position_${locale}`]) ||
  position[`position_${DEFAULT_LOCALE}`];

export const hexToRgba = (hex, opacity) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  // prettier-ignore
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16,
    )}, ${opacity || 1})`
    : null;
};

export const getPositionStats = (config, countries) => {
  const values =
    (config.info && config.info.values) ||
    (config.key && config.key.iconValue && config.key.iconValue.full);
  if (values && countries) {
    return values.map(val => {
      const positionItems = countries.filter(
        item => item.position && quasiEquals(item.position.position_id, val),
      );
      return {
        val,
        count: positionItems.length,
      };
    });
  }
  return null;
};
