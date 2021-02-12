/*
 * PanelTransfers Messages
 *
 * This contains all the text for the PanelTransfers container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.PanelTransfers';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Analyse plastic flows',
  },
  mode_gyres: {
    id: `${scope}.mode_gyres`,
    defaultMessage: 'Regions to gyres',
  },
  mode_countries: {
    id: `${scope}.mode_countries`,
    defaultMessage: 'Regions to countries*',
  },
});
