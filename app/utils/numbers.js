import isNumber from 'is-number';

export const roundNumber = (value, digits = 1) => {
  const parsed = parseFloat(value);
  const factor = 10 ** Math.min(digits, 10);
  return isNumber(parsed) && Math.round(value * factor) / factor;
};

export const formatNumber = (value, abbrevThousands, intl) => {
  if (abbrevThousands && value >= 1000) {
    return `${intl.formatNumber(roundNumber(value / 1000, 0))}k`;
  }
  return intl.formatNumber(value);
};

export default { isNumber };
