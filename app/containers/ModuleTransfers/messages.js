/*
 * PanelExplore Messages
 *
 * This contains all the text for the PanelExplore container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.PanelExplore';

export default defineMessages({
  showLayerPanel: {
    id: `${scope}.showLayerPanel`,
    defaultMessage: 'Layers',
  },
  showProjects: {
    id: `${scope}.showProjects`,
    defaultMessage: 'Show WWF-projects',
  },
  hideProjects: {
    id: `${scope}.hideProjects`,
    defaultMessage: 'Hide WWF-projects',
  },
  showProjectsShort: {
    id: `${scope}.showProjectsShort`,
    defaultMessage: 'Show projects',
  },
  hideProjectsShort: {
    id: `${scope}.hideProjectsShort`,
    defaultMessage: 'Hide projects',
  },
});
