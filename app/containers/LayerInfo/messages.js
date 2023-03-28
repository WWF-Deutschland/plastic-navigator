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
  countryChartTitle: {
    id: `${scope}.countryChartTitle`,
    defaultMessage: 'Number of countries by policy position',
  },
  countryChartNoSources: {
    id: `${scope}.countryChartNoSources`,
    defaultMessage: 'Individual statements: ',
  },
  countryChartDateLabel: {
    id: `${scope}.countryChartDateLabel`,
    defaultMessage: 'Status: {date}',
  },
  placeholderDefault: {
    id: `${scope}.placeholderDefault`,
    defaultMessage: 'Filter list by name',
  },
  placeholderCountries: {
    id: `${scope}.placeholderCountries`,
    defaultMessage: 'Filter list by country name or code',
  },
  noSearchResults: {
    id: `${scope}.noSearchResults`,
    defaultMessage: 'No results for current search',
  },
  downloadPolicyData: {
    id: `${scope}.downloadPolicyData`,
    defaultMessage: 'Download all country positions (CSV)',
  },
  showCountryLink: {
    id: `${scope}.showCountryLink`,
    defaultMessage: 'Get link to country view',
  },
  shareCountryLink: {
    id: `${scope}.shareCountryLink`,
    defaultMessage: 'Copy link to country view',
  },
  moduleOverview: {
    id: `${scope}.moduleOverview`,
    defaultMessage: 'Overview',
  },
});
