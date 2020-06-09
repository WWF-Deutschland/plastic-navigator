/**
 * Quasi-equality test of 2 values, allowing comparing numbers and strings
 *
 * @param {number|string|null} testValue the value to test
 * @param {number|string|null} value the value to test against
 * @return {boolean} if values are quasi equal
 */
export default function quasiEquals(testValue, value) {
  if (typeof value === 'undefined' || typeof testValue === 'undefined') {
    return undefined;
  }
  if (testValue === null) {
    return value === null || value === 'null';
  }
  if (value === null) {
    return testValue === null || testValue === 'null';
  }
  return value.toString() === testValue.toString();
}
