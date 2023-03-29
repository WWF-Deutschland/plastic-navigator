/**
 *
 * CountryList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { intlShape, injectIntl } from 'react-intl';

import { filterCountries } from 'utils/string';

import { setLayerInfo } from 'containers/App/actions';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';
import messages from '../messages';

export function CountryList({ countries, intl, config }) {
  return countries ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries, {
        count: countries.length,
        isSingle: countries.length === 1,
      })}
      layerId={config.id}
      items={countries}
      config={config}
      search={filterCountries}
      placeholder={intl.formatMessage(messages.placeholderCountries)}
    />
  ) : null;
}

CountryList.propTypes = {
  config: PropTypes.object,
  countries: PropTypes.array,
  intl: intlShape.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryList));
