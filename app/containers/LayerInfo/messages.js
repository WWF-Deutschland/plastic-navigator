/*
 * LayerInfo Messages
 *
 * This contains all the text for the LayerInfo container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.LayerInfo';

export default defineMessages({
  titleReference: {
    id: `${scope}.titleReference`,
    defaultMessage: 'Reference',
  },
  multiplePositions: {
    id: `${scope}.multiplePositions`,
    defaultMessage: 'Multiple Positions',
  },
  position: {
    id: `${scope}.position`,
    defaultMessage: 'Position',
  },
  quote: {
    id: `${scope}.quote`,
    defaultMessage: 'Statement',
  },
  source: {
    id: `${scope}.source`,
    defaultMessage: 'Source',
  },
  sourceLinkExternal: {
    id: `${scope}.sourceLinkExternal`,
    defaultMessage: 'Go to source',
  },
  projectLinkExternal: {
    id: `${scope}.projectLinkExternal`,
    defaultMessage: 'Visit project website',
  },
  countryPositionSelect: {
    id: `${scope}.countryPositionSelect`,
    defaultMessage: 'Select a country for details',
  },
  countryChartTitle: {
    id: `${scope}.countryChartTitle`,
    defaultMessage: 'Number of countries by policy position (with sources)',
  },
});
