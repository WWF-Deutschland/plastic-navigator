/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Header';

export default defineMessages({
  navSectionModules: {
    id: `${scope}.navSectionModules`,
    defaultMessage: 'Sections',
  },
  navSectionPages: {
    id: `${scope}.navSectionPages`,
    defaultMessage: 'Pages',
  },
  navSectionLanguages: {
    id: `${scope}.navSectionLanguages`,
    defaultMessage: 'Pages',
  },
});
