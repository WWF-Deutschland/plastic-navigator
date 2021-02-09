import asArray from 'utils/as-array';
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
      if (config.key && config.key.values) {
        const aIndex =
          a.position_id && config.key.values.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.values.indexOf(b.position_id);
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
  const iconuri = config.icon.datauri.default || config.icon.datauri;
  return iconuri ? iconuri[position.position_id] : null;
};

export const getPositionSquareStyle = (position, config) => {
  if (config.featureStyle && config.featureStyle.property) {
    const ps = config.featureStyle.property.split('.');
    const positionValue = position[ps[1]];
    const style = Object.keys(config.featureStyle.style).reduce(
      (styleMemo, attr) => {
        const attrObject = config.featureStyle.style[attr];
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
      {},
    );
    return {
      stroke: true,
      weight: 1,
      fill: true,
      fillOpacity: 0.4,
      ...style,
    };
  }
  return null;
};

export const getPositionLabel = (position, locale) =>
  (locale && position[`position_${locale}`]) ||
  position[`position_${DEFAULT_LOCALE}`];
