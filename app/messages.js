/*
 * Common Messages
 *
 * This contains all the common text
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.common';

export default defineMessages({
  appTitle: {
    id: `${scope}.appTitle`,
    defaultMessage: 'Marine Plastic Explorer',
  },
  navExplore: {
    id: `${scope}.navExplore`,
    defaultMessage: 'Explore',
  },
  page_about: {
    id: `${scope}.page_about`,
    defaultMessage: 'About',
  },
});
