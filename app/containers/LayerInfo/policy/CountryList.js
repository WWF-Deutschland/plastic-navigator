/**
 *
 * CountryList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

import { filterCountries } from 'utils/string';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';
import messages from '../messages';

export function CountryList({ countries, intl, config, topic }) {
  return countries ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries, {
        count: countries.length,
        isSingle: countries.length === 1,
      })}
      layerId={`${config.id}_${topic.id}`}
      items={countries}
      config={config}
      search={filterCountries}
      placeholder={intl.formatMessage(messages.placeholderCountries)}
    />
  ) : null;
}

CountryList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  countries: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(CountryList);
