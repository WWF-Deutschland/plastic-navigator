/**
 *
 * SourceList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Box } from 'grommet';

import { setItemInfo } from 'containers/App/actions';
import { filterSources, isAggregate } from 'utils/policy';

import coreMessages from 'messages';
import messages from '../messages';

import FeatureList from '../FeatureList';
import Hint from 'components/Hint';
export function SourceList({ sources, config, topic, intl, onSetItemInfo }) {
  if (isAggregate(topic)) {
    return (
      <Box margin={{ top: 'medium' }} responsive={false}>
        <Hint>
          <FormattedMessage {...messages.noStatementsAggregateTopicHint} />
        </Hint>
      </Box>
    );
  }

  return sources ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.sources, {
        count: sources.length,
        isSingle: sources.length === 1,
      })}
      items={sources}
      config={config}
      search={filterSources}
      isSourceList
      onSetItemInfo={id =>
        onSetItemInfo(`${config.id}_${topic.id}|source-${id}`)
      }
    />
  ) : null;
}

SourceList.propTypes = {
  config: PropTypes.object,
  topic: PropTypes.object,
  sources: PropTypes.array,
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

export default compose(withConnect)(injectIntl(SourceList));
