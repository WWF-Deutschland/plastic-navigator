/**
 *
 * TopicCountryList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { ResponsiveContext } from 'grommet';

import { selectCountriesForTopic } from 'containers/Map/selectors';

import { setItemInfo } from 'containers/App/actions';
import { filterCountries } from 'utils/policy';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';
import messages from '../messages';

export function TopicCountryList({
  intl,
  config,
  topic,
  onSetItemInfo,
  countriesWithPosition,
}) {
  const size = React.useContext(ResponsiveContext);
  // if (isAggregate(topic)) {
  //   countries =
  //     layerInfo &&
  //     layerInfo.data &&
  //     getCountriesWithStrongestPositionAggregated({
  //       indicator: topic,
  //       layerInfo,
  //       locale,
  //     });
  // } else {
  // const countries = getCountriesWithPosition({
  //   indicatorId: topic.id,
  //   layerInfo,
  //   locale,
  //   positionsOverTime,
  // });
  // }
  return countriesWithPosition ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.countries, {
        count: countriesWithPosition.length,
        isSingle: countriesWithPosition.length === 1,
      })}
      items={countriesWithPosition}
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

TopicCountryList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  countriesWithPosition: PropTypes.array,
  onSetItemInfo: PropTypes.func,
  intl: intlShape.isRequired,
};
const mapStateToProps = createStructuredSelector({
  countriesWithPosition: (state, { topic }) =>
    selectCountriesForTopic(state, { indicatorId: topic.id }),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetItemInfo: id => {
      dispatch(setItemInfo(id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(TopicCountryList));
