/**
 *
 * PanelBody
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
// import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
// import {
//   // Box,
//   // Heading,
//   // Paragraph,
// } from 'grommet';

// import { DEFAULT_LOCALE } from 'i18n';

// import {
//   // selectLayersConfig,
//   // selectLocale,
//   // selectUIStateByKey,
// } from 'containers/App/selectors';

// import messages from './messages';
// import commonMessages from 'messages';

import { loadData } from './actions';
import { selectDataForAnalysis } from './selectors';
import { getTransfersKey, getNodesKey } from './utils';

const Styled = styled.div`
  width: 100%;
`;

export function Analysis({ id, analysisConfig, onLoadData, data }) {
  useEffect(() => {
    onLoadData(analysisConfig);
  }, [id]);
  // console.log('analysisConfig', analysisConfig);
  // console.log('data', data);
  // prettier-ignore
  return (
    <Styled>
      <h3>
        {analysisConfig.id}
      </h3>
      <div>
        <h4>Options</h4>
        {data && data.nodes && data.nodes.from && (
          <div>
            <span>Regions: </span>
            {data && data.nodes && data.nodes.from.length}
          </div>
        )}
        {data && data.nodes && data.nodes.to && (
          <div>
            <span>Gyres: </span>
            {data && data.nodes && data.nodes.to.length}
          </div>
        )}
        {data && data.nodes && !data.nodes.to && !data.nodes.from && (
          <div>
            <span>Countries: </span>
            {data && data.nodes && data.nodes.length}
          </div>
        )}
      </div>
      <div>
        <h4>Data points</h4>
        {data && data.transfer && data.transfer.length}
      </div>
    </Styled>
  );
}

Analysis.propTypes = {
  id: PropTypes.string,
  onLoadData: PropTypes.func,
  // onSetTab: PropTypes.func,
  // // layersConfig: PropTypes.array,
  // // locale: PropTypes.string,
  // uiState: PropTypes.object,
  analysisConfig: PropTypes.object,
  data: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  data: (state, { analysisConfig }) =>
    selectDataForAnalysis(state, analysisConfig),
  // locale: state => selectLocale(state),
  // uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  // activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadData: config => {
      // load transfer data
      dispatch(loadData(getTransfersKey(config), config.transfer.data));
      if (config.dir === 'uni') {
        // load 'from' nodes
        dispatch(loadData(getNodesKey(config, 'from'), config.nodes.from.data));
        // load 'to' nodes
        dispatch(loadData(getNodesKey(config, 'to'), config.nodes.to.data));
      } else {
        dispatch(loadData(getNodesKey(config), config.nodes.data));
      }
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Analysis);
// export default PanelTransfers;
