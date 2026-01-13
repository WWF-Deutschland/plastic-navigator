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
import { ResponsiveContext } from 'grommet';

import { setItemInfo } from 'containers/App/actions';
import {
  filterCountries,
  getCountriesWithPosition,
  getCountriesWithStrongestPositionAggregated,
  isAggregate,
} from 'utils/policy';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';
import messages from '../messages';

export function CountryList({
  layerInfo,
  intl,
  config,
  topic,
  onSetItemInfo,
  positionsOverTime,
}) {
  const { locale } = intl;
  const size = React.useContext(ResponsiveContext);
  let countries;
  if (isAggregate(topic)) {
    countries =
      layerInfo &&
      layerInfo.data &&
      getCountriesWithStrongestPositionAggregated({
        indicator: topic,
        layerInfo,
        locale,
      });
  } else {
    countries = getCountriesWithPosition({
      indicatorId: topic.id,
      layerInfo,
      locale,
      positionsOverTime,
    });
  }
  console.log('positionsOverTime', positionsOverTime)
  console.log('countries', countries)
  return countries ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries, {
        count: countries.length,
        isSingle: countries.length === 1,
      })}
      items={countries}
      config={config}
      search={filterCountries}
      placeholder={intl.formatMessage(messages.placeholderCountries, {
        isSmall: size === 'small',
      })}
      onSetItemInfo={id =>
        onSetItemInfo(`${config.id}_${topic.id}|country-${id}`)
      }
      exportToCSV={items =>
        items.map(item => ({
          country_code: item.code,
          country_label: item.label,
          level_of_support: item.position && item.position.value,
        }))
      }
      exportToCSVFilename={`country-positions_topic-${
        topic.id
      }_${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`}
    />
  ) : null;
}

CountryList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  positionsOverTime: PropTypes.object,
  layerInfo: PropTypes.object,
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
