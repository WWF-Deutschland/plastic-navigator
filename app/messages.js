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
  module_explore: {
    id: `${scope}.module_explore`,
    defaultMessage: 'Explore',
  },
  module_stories: {
    id: `${scope}.module_stories`,
    defaultMessage: 'Intro',
  },
  page_about: {
    id: `${scope}.page_about`,
    defaultMessage: 'About',
  },
  page_glossary: {
    id: `${scope}.page_glossary`,
    defaultMessage: 'Glossary',
  },
  locations: {
    id: `${scope}.locations`,
    defaultMessage: 'Locations',
  },
});
