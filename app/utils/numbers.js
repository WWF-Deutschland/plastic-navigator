import isNumber from 'is-number';

export const roundNumber = (value, digits = 1, relevant = true) => {
  const parsed = parseFloat(value);
  let factor;
  if (relevant) {
    const relevantIndex = Math.floor(Math.log10(parsed));
    factor = 10 ** Math.max(Math.abs(relevantIndex - digits + 1), 1);
  } else {
    factor = 10 ** Math.min(digits, 0);
  }
  return isNumber(parsed) && Math.round(parsed * factor) / factor;
};

export const formatNumber = (value, abbrevThousands, intl) => {
  if (abbrevThousands && value >= 1000) {
    return `${intl.formatNumber(roundNumber(value / 1000, 0))}k`;
  }
  return intl.formatNumber(value);
};

export default { isNumber };
