/*
 * GroupLayers Messages
 *
 * This contains all the text for the GroupLayers component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.components.KeyFull';

export default defineMessages({
  less: {
    id: `${scope}.less`,
    defaultMessage: 'Less',
  },
  more: {
    id: `${scope}.more`,
    defaultMessage: 'More',
  },
  'by-weight': {
    id: `${scope}.by-weight`,
    defaultMessage: '(by weight)',
  },
  'and-more': {
    id: `${scope}.and-more`,
    defaultMessage: 'and more',
  },
  'and-less': {
    id: `${scope}.and-less`,
    defaultMessage: 'and less',
  },
  'in-unit': {
    id: `${scope}.in-unit`,
    defaultMessage: 'in',
  },
});
