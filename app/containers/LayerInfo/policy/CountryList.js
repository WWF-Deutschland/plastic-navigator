/**
 *
 * CountryList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { setItemInfo } from 'containers/App/actions';
import { filterCountries } from 'utils/policy';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';
import messages from '../messages';

export function CountryList({ countries, intl, config, topic, onSetItemInfo }) {
  return countries ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries, {
        count: countries.length,
        isSingle: countries.length === 1,
      })}
      items={countries}
      config={config}
      search={filterCountries}
      placeholder={intl.formatMessage(messages.placeholderCountries)}
      onSetItemInfo={id =>
        onSetItemInfo(`${config.id}_${topic.id}|country-${id}`)
      }
    />
  ) : null;
}

CountryList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  countries: PropTypes.array,
  onSetItemInfo: PropTypes.func,
  intl: intlShape.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    onSetItemInfo: id => {
      dispatch(setItemInfo(id));
    },
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryList));
