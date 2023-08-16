/*
 * GroupLayers Messages
 *
 * This contains all the text for the GroupLayers component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.components.GroupLayers';

export default defineMessages({
  columnLayer: {
    id: `${scope}.columnLayer`,
    defaultMessage: 'Layer',
  },
  columnProject: {
    id: `${scope}.columnProject`,
    defaultMessage: 'Project',
  },
  columnIndicator: {
    id: `${scope}.columnIndicator`,
    defaultMessage: 'Topic',
  },
  columnKey: {
    id: `${scope}.columnKey`,
    defaultMessage: 'Key',
  },
  columnInfo: {
    id: `${scope}.columnInfo`,
    defaultMessage: 'Read more',
  },
  info: {
    id: `${scope}.info`,
    defaultMessage: 'Info',
  },
});
