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
    defaultMessage: 'Between countries',
  },
  title_to_gyres: {
    id: `${scope}.title_to_gyres`,
    defaultMessage:
      'Where does the floating debris originate that accumulates in gyre?',
  },
  title_from_gyres: {
    id: `${scope}.title_from_gyres`,
    defaultMessage:
      'Where do ocean currents take marine debris when entering the oceans from a selected region?',
  },
  title_to_countries: {
    id: `${scope}.title_to_countries`,
    defaultMessage:
      "Where does the floating debris originate that enters a country's EEZ?",
  },
  title_from_countries: {
    id: `${scope}.title_from_countries`,
    defaultMessage:
      'Where do ocean currents take marine debris when entering the oceans from a selected country?',
  },
  intro_to_gyres: {
    id: `${scope}.intro_to_gyres`,
    defaultMessage: 'See relative emissions of marine debris by region. ',
  },
  intro_from_gyres: {
    id: `${scope}.intro_from_gyres`,
    defaultMessage:
      "See a region's relative contributions to the different gyres. ",
  },
  intro_to_countries: {
    id: `${scope}.intro_to_countries`,
    defaultMessage:
      'See relative contributions of marine debris from multiple country Exclusive Economic Zones (EEZ). ',
  },
  intro_from_countries: {
    id: `${scope}.intro_from_countries`,
    defaultMessage:
      "See a country's relative contributions of marine debris to the different country . ",
  },
  hint_countries: {
    id: `${scope}.hint_countries`,
    defaultMessage:
      "In this analysis 'countries' refer to individual country EEZs. ",
  },
  hint_gyres: {
    id: `${scope}.hint_gyres`,
    defaultMessage:
      "In this analysis 'gyres' may refer to all identified accumulation zones, including 'marginal seas'. 'Regions' can be based on Exclusive Economic Zones (EEZ) of one or more countries. ",
  },
  label_direction_countries: {
    id: `${scope}.label_direction_countries`,
    defaultMessage: 'Select direction',
  },
  label_direction_gyres: {
    id: `${scope}.label_direction_gyres`,
    defaultMessage: 'Select direction',
  },
  button_from_countries: {
    id: `${scope}.button_from_countries`,
    defaultMessage: 'Emitting',
  },
  button_to_countries: {
    id: `${scope}.button_to_countries`,
    defaultMessage: 'Receiving',
  },
  button_from_gyres: {
    id: `${scope}.button_from_gyres`,
    defaultMessage: 'Region',
  },
  button_to_gyres: {
    id: `${scope}.button_to_gyres`,
    defaultMessage: 'Gyre',
  },
  select_label_from_countries: {
    id: `${scope}.select_label_from_countries`,
    defaultMessage: 'Select country EEZ',
  },
  select_label_to_countries: {
    id: `${scope}.select_label_to_countries`,
    defaultMessage: 'Select country EEZ',
  },
  select_label_from_gyres: {
    id: `${scope}.select_label_from_gyres`,
    defaultMessage: 'Select region',
  },
  select_label_to_gyres: {
    id: `${scope}.select_label_to_gyres`,
    defaultMessage: 'Select gyre',
  },
  select_placeholder_from_countries: {
    id: `${scope}.select_placeholder_from_countries`,
    defaultMessage: 'Emitting country EEZ',
  },
  select_placeholder_to_countries: {
    id: `${scope}.select_placeholder_to_countries`,
    defaultMessage: 'Receiving country EEZ',
  },
  select_placeholder_from_gyres: {
    id: `${scope}.select_placeholder_from_gyres`,
    defaultMessage: 'Emitting region',
  },
  select_placeholder_to_gyres: {
    id: `${scope}.select_placeholder_to_gyres`,
    defaultMessage: 'Receiving gyre',
  },
  label_other_from_countries: {
    id: `${scope}.label_other_from_countries`,
    defaultMessage: '{count} other countries',
  },
  label_other_to_countries: {
    id: `${scope}.label_other_to_countries`,
    defaultMessage: '{count} other countries',
  },
  label_other_from_gyres: {
    id: `${scope}.label_other_from_gyres`,
    defaultMessage: '{count} other gyres',
  },
  label_other_to_gyres: {
    id: `${scope}.label_other_to_gyres`,
    defaultMessage: '{count} other regions',
  },
  hint_other_from_countries: {
    id: `${scope}.hint_other_from_countries`,
    defaultMessage: 'Other countries: ',
  },
  hint_other_to_countries: {
    id: `${scope}.hint_other_to_countries`,
    defaultMessage: 'Other countries: ',
  },
  hint_other_from_gyres: {
    id: `${scope}.hint_other_from_gyres`,
    defaultMessage: 'Other gyres: ',
  },
  hint_other_to_gyres: {
    id: `${scope}.hint_other_to_gyres`,
    defaultMessage: 'Other regions: ',
  },
  noDataForNode: {
    id: `${scope}.noDataForNode`,
    defaultMessage: 'No data for previously selected option',
  },
});
