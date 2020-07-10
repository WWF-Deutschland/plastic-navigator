export default function isNumber(test) {
  /* eslint-disable no-restricted-globals */
  return !isNaN(parseFloat(test)) && isFinite(test);
  /* eslint-enable no-restricted-globals */
}
