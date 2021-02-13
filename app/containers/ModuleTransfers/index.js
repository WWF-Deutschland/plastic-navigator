/**
 *
 * ModuleTransfers
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import styled from 'styled-components';
import { Box, Button, ResponsiveContext, Layer } from 'grommet';
// import { getAsideWidth, isMaxSize } from 'utils/responsive';

import { MODULES } from 'config';

import PanelTransfers from 'containers/PanelTransfers';
import ModuleWrap from 'components/ModuleWrap';
import { ExploreS } from 'components/Icons';

import {
  selectConfigByKey,
  selectActiveLayers,
  selectUIStateByKey,
  selectFirstLanding,
} from 'containers/App/selectors';
import { setLayers, setUIState, setLanding } from 'containers/App/actions';

import commonMessages from 'messages';
import messages from './messages';

const Buttons = styled(props => <Box gap="small" direction="row" {...props} />)`
  position: absolute;
  right: 12px;
  top: 22px;
  pointer-events: all;
`;

// prettier-ignore
const ShowButton = styled(p => <Button plain reverse {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 16px;
  background: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'white' : 'brand']};
  color: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'black' : 'white']};
  border-radius: 20px;
  padding: 2px 13px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  &:hover {
    background: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'lightHover' : 'brandDark']};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 5px 15px 5px 21px;
  }
`;

const COMPONENT_KEY = 'ModuleTransfers';

const DEFAULT_UI_STATE = {
  layersMemo: null,
};

export function ModuleTransfers({
  onSetLayers,
  uiState,
  onMemoLayers,
  activeLayers,
  firstLanding,
  onSetLanding,
  intl,
  analysesConfig,
}) {
  const { layersMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  useEffect(() => {
    if (layersMemo) {
      onSetLayers(layersMemo);
    } else if (MODULES.transfers.layers && !firstLanding) {
      onSetLayers(MODULES.transfers.layers);
    }
    if (firstLanding) {
      onSetLanding();
    }
  }, []);
  useEffect(() => {
    onMemoLayers(activeLayers, uiState);
  }, [activeLayers]);

  const [show, setShow] = useState(true);
  const [showSmall, setShowSmall] = useState(false);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <div>
          <Helmet>
            <title>{`${intl.formatMessage(
              commonMessages.module_transfers_metaTitle,
            )}`}</title>
          </Helmet>
          <ModuleWrap>
            {show && size !== 'small' && (
              <PanelTransfers
                analysesConfig={analysesConfig}
                onClose={() => setShow(false)}
              />
            )}
            {showSmall && size === 'small' && (
              <Layer full>
                <PanelTransfers
                  analysesConfig={analysesConfig}
                  onClose={() => setShowSmall(false)}
                />
              </Layer>
            )}
            {((!show && size !== 'small') ||
              (!showSmall && size === 'small')) && (
              <Buttons>
                <ShowButton
                  onClick={() => {
                    setShow(true);
                    setShowSmall(true);
                  }}
                  icon={<ExploreS color="white" />}
                  label={<FormattedMessage {...messages.showLayerPanel} />}
                />
              </Buttons>
            )}
          </ModuleWrap>
        </div>
      )}
    </ResponsiveContext.Consumer>
  );
}

ModuleTransfers.propTypes = {
  // layerIds: PropTypes.array,
  onSetLayers: PropTypes.func,
  onMemoLayers: PropTypes.func,
  onSetLanding: PropTypes.func,
  activeLayers: PropTypes.array,
  uiState: PropTypes.object,
  firstLanding: PropTypes.bool,
  intl: intlShape.isRequired,
  analysesConfig: PropTypes.array,
};

const mapStateToProps = createStructuredSelector({
  // layerIds: state => selectActiveLayers(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
  firstLanding: state => selectFirstLanding(state),
  analysesConfig: state => selectConfigByKey(state, { key: 'transfers' }),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLanding: () => dispatch(setLanding()),
    onSetLayers: layers => dispatch(setLayers(layers)),
    onMemoLayers: (layers, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { layersMemo: layers }),
        ),
      ),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ModuleTransfers));
// export default ModuleTransfers;
