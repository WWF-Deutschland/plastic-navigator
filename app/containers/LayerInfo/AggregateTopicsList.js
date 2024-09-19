/**
 *
 * SourceList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';

import { isAggregate, isArchived } from 'utils/policy';
import messages from './messages';

import FeatureList from './FeatureList';

export function AggregateTopicsList({ topics, config, intl, onSetTopic }) {
  const { locale } = intl;
  const childIndicators = topics.reduce((memo, topic) => {
    if (topic && (isAggregate(topic) || isArchived(topic))) {
      return memo;
    }
    return [
      ...memo,
      {
        ...topic,
        label: topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`],
      },
    ];
  }, []);
  return childIndicators ? (
    <FeatureList
      title={intl.formatMessage(messages.topicsTabTitle, {
        count: childIndicators.length,
        isSingle: childIndicators.length === 1,
      })}
      items={childIndicators}
      config={config}
      isTopicsList
      onSetTopic={id => onSetTopic(id)}
    />
  ) : null;
}

AggregateTopicsList.propTypes = {
  config: PropTypes.object,
  topics: PropTypes.array,
  onSetTopic: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(AggregateTopicsList);
