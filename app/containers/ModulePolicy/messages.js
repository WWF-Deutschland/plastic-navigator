/*
 * PanelExplore Messages
 *
 * This contains all the text for the PanelExplore container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.ModulePolicy';

export default defineMessages({
  showLayerPanel: {
    id: `${scope}.showLayerPanel`,
    defaultMessage: 'Policy info',
  },
  selectTopics: {
    id: `${scope}.selectTopics`,
    defaultMessage: 'Select a policy topic to explore',
  },
  selectArchivedTopics: {
    id: `${scope}.selectArchivedTopics`,
    defaultMessage: 'Archived topics',
  },
  select: {
    id: `${scope}.select`,
    defaultMessage: 'Select',
  },
});
