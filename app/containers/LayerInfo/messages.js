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
  singleTopic: {
    id: `${scope}.singleTopic`,
    defaultMessage: 'Statement position for topic',
  },
  multipleTopics: {
    id: `${scope}.multipleTopics`,
    defaultMessage: 'Statement positions by topic',
  },
  multipleStatementsCountry: {
    id: `${scope}.multipleStatementsCountry`,
    defaultMessage: 'Statements for topic',
  },
  singleStatementCountry: {
    id: `${scope}.singleStatementCountry`,
    defaultMessage: 'Statement for topic',
  },
  noStatement: {
    id: `${scope}.noStatement`,
    defaultMessage: 'No statement recorded',
  },
  position: {
    id: `${scope}.position`,
    defaultMessage: 'Position',
  },
  statementPosition: {
    id: `${scope}.statementPosition`,
    defaultMessage: 'Statement position',
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
  hidePanel: {
    id: `${scope}.hidePanel`,
    defaultMessage: 'Hide panel',
  },
  hidePanelSmall: {
    id: `${scope}.hidePanelSmall`,
    defaultMessage: 'Show map',
  },
  scoreCardLabel: {
    id: `${scope}.scoreCardLabel`,
    defaultMessage: 'Policy position by topic',
  },
  scoreCardSelect: {
    id: `${scope}.scoreCardSelect`,
    defaultMessage: 'Select a topic to view statements and show on map',
  },
  latestPositionLabel: {
    id: `${scope}.latestPositionLabel`,
    defaultMessage: 'Current position',
  },
  countryStatementLinkLabel: {
    id: `${scope}.countryStatementLinkLabel`,
    defaultMessage: 'Go to statement',
  },
  noLocationInfo: {
    id: `${scope}.noLocationInfo`,
    defaultMessage:
      'There is currently no information available for the selected project location, but you can use the link above to learn more about the project',
  },
  moreLocationInfo: {
    id: `${scope}.moreLocationInfo`,
    defaultMessage:
      "You can use the link above to learn more about the selected location's project",
  },
  otherStatements: {
    id: `${scope}.otherStatements`,
    defaultMessage:
      '{countOther} other {isSingle, select, true {statement} false {statements}} (see tab)',
  },
  tabDetails: {
    id: `${scope}.tabDetails`,
    defaultMessage: 'Details',
  },
  tabCountries: {
    id: `${scope}.tabCountries`,
    defaultMessage: 'States',
  },
  tabStatements: {
    id: `${scope}.tabStatements`,
    defaultMessage: 'Statements',
  },
  selectArchivedTopics: {
    id: `${scope}.selectArchivedTopics`,
    defaultMessage: 'Archived topics',
  },
  selectCurrentTopics: {
    id: `${scope}.selectCurrentTopics`,
    defaultMessage: 'Current topics',
  },
  noStatementsHint: {
    id: `${scope}.noStatementsHint`,
    defaultMessage:
      'Please refer to the underlying topics or individual countries',
  },
});
