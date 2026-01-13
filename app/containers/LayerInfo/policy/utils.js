// import { sortLabels } from 'utils/string';
// import asArray from 'utils/as-array';
// import quasiEquals from 'utils/quasi-equals';
//
// import { DEFAULT_LOCALE } from 'i18n';

export const getCountryPositionSquareStyle = ({ positionValue, config }) => {
  if (config['styles-by-value'] && typeof positionValue !== 'undefined') {
    const style = config['styles-by-value'][positionValue.toString()];
    return {
      stroke: true,
      weight: 1,
      fill: true,
      ...style,
    };
  }
  return null;
};
