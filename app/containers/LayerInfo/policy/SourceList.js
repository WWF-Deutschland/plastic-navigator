/**
 *
 * SourceList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { intlShape, injectIntl } from 'react-intl';

import { filterSources } from 'utils/string';

import { setLayerInfo } from 'containers/App/actions';

import coreMessages from 'messages';

import FeatureList from '../FeatureList';

export function SourceList({ sources, config, intl }) {
  return sources ? (
    <FeatureList
      title={intl.formatMessage(coreMessages.sources, {
        count: Object.keys(sources).length,
        isSingle: Object.keys(sources).length === 1,
      })}
      layerId={config.id}
      items={sources}
      config={config}
      search={filterSources}
      isSourceList
    />
  ) : null;
}

SourceList.propTypes = {
  config: PropTypes.object,
  sources: PropTypes.array,
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

export default compose(withConnect)(injectIntl(SourceList));
