/*
 * Map Messages
 *
 * This contains all the text for the Map container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.PanelKey';

export default defineMessages({
  keyTabKey: {
    id: `${scope}.keyTabKey`,
    defaultMessage: 'Key',
  },
  keyTabAbout: {
    id: `${scope}.keyTabAbout`,
    defaultMessage: 'Annotation',
  },
  keyProjectsTitle: {
    id: `${scope}.keyProjectsTitle`,
    defaultMessage: 'WWF Projects',
  },
  keyProjectsAbout: {
    id: `${scope}.keyProjectsAbout`,
    defaultMessage: 'About the WWF Projects',
  },
});
