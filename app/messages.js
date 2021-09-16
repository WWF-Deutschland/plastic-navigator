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
  brandLink: {
    id: `${scope}.brandLink`,
    defaultMessage: '//wwf.de',
  },
  brandLinkTitle: {
    id: `${scope}.brandLinkTitle`,
    defaultMessage: 'WWF Germany',
  },
  module_explore: {
    id: `${scope}.module_explore`,
    defaultMessage: 'Explore',
  },
  module_stories: {
    id: `${scope}.module_stories`,
    defaultMessage: 'Intro',
  },
  module_policy: {
    id: `${scope}.module_policy`,
    defaultMessage: 'Policy',
  },
  module_explore_metaTitle: {
    id: `${scope}.module_explore_metaTitle`,
    defaultMessage: 'Explore',
  },
  module_policy_metaTitle: {
    id: `${scope}.module_policy_metaTitle`,
    defaultMessage: 'Policy',
  },
  module_stories_metaTitle: {
    id: `${scope}.module_stories_metaTitle`,
    defaultMessage: 'Introduction',
  },
  page_about: {
    id: `${scope}.page_about`,
    defaultMessage: 'About',
  },
  page_privacy: {
    id: `${scope}.page_privacy`,
    defaultMessage: 'Privacy',
  },
  page_glossary: {
    id: `${scope}.page_glossary`,
    defaultMessage: 'Glossary',
  },
  locations: {
    id: `${scope}.locations`,
    defaultMessage: 'Locations',
  },
  projectLocation: {
    id: `${scope}.projectLocation`,
    defaultMessage: 'Project location',
  },
  countries: {
    id: `${scope}.countries`,
    defaultMessage: '{count} countries',
  },
  sources: {
    id: `${scope}.sources`,
    defaultMessage: '{count} statements',
  },
  label_hide: {
    id: `${scope}.label_hide`,
    defaultMessage: 'hide',
  },
});
