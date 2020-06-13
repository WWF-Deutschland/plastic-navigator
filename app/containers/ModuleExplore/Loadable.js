/**
 *
 * Asynchronously loads the component for ModuleExplore
 *
 */

import loadable from 'utils/loadable';

export default loadable(() => import('./index'));
