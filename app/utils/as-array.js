/**
 * Make sure we have an array: will create a 1-element array for non-array objects
 *
 * @param {object} v an array or an object to be returned as array
 * @return {array} an array
 */
export default function asArray(v) {
  return Array.isArray(v) ? v : [v];
}
