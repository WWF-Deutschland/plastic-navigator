/*
 * Map Messages
 *
 * This contains all the text for the Map container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Map';

export default defineMessages({
  keyTabKey: {
    id: `${scope}.keyTabKey`,
    defaultMessage: 'Key',
  },
  keyTabAbout: {
    id: `${scope}.keyTabAbout`,
    defaultMessage: 'About',
  },
  keyProjectsTitle: {
    id: `${scope}.keyProjectsTitle`,
    defaultMessage: 'WWF Projects',
  },
  keyProjectsAbout: {
    id: `${scope}.keyProjectsTitle`,
    defaultMessage: 'About the WWF Projects',
  },
});
