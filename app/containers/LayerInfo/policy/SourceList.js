/**
 *
 * SourceList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import { intlShape, injectIntl } from 'react-intl';

import { filterSources } from 'utils/string';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';

export function SourceList({ sources, config, topic, intl }) {
  return sources ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.sources, {
        count: Object.keys(sources).length,
        isSingle: Object.keys(sources).length === 1,
      })}
      layerId={`${config.id}_${topic.id}`}
      items={sources}
      config={config}
      search={filterSources}
      isSourceList
    />
  ) : null;
}

SourceList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  sources: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(SourceList);
