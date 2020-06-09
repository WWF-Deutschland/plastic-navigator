/**
 *
 * Asynchronously loads the component for RoutePage
 *
 */

import loadable from 'utils/loadable';

export default loadable(() => import('./index'));
