/**
 *
 * ModulePolicy
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import styled from 'styled-components';
// import { Box, Button, ResponsiveContext } from 'grommet';
import { Box, Button } from 'grommet';
// import { getAsideWidth, isMaxSize } from 'utils/responsive';

import { MODULES } from 'config';

import ModuleWrap from 'components/ModuleWrap';
import { Policy } from 'components/Icons';
import LayerInfo from 'containers/LayerInfo';

import {
  selectActiveLayers,
  selectUIStateByKey,
  selectFirstLanding,
  selectInfoSearch,
  selectUIURLByKey,
} from 'containers/App/selectors';
import {
  setLayers,
  setUIState,
  setLanding,
  setLayerInfo,
  showLayerInfoModule,
  setUIURL,
} from 'containers/App/actions';

import { getLayerIdFromView } from 'utils/layers';
import { startsWith } from 'utils/string';

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

const COMPONENT_KEY = 'mpol';

const DEFAULT_UI_STATE = {
  layersMemo: null,
  viewMemo: null,
};
const DEFAULT_UI_URL_STATE = {
  show: true,
};

export function ModulePolicy({
  onSetLayers,
  uiState,
  onMemo,
  activeLayers,
  firstLanding,
  onSetLanding,
  intl,
  onSetLayerInfo,
  info,
  uiURL,
  onShow,
  onHideLayerInfo,
}) {
  const layerId = getLayerIdFromView(info);
  const { layersMemo, viewMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  const { show } = uiURL
    ? Object.assign({}, DEFAULT_UI_STATE, uiURL)
    : DEFAULT_UI_URL_STATE;

  useEffect(() => {
    if (layersMemo) {
      onSetLayers(layersMemo);
    } else if (MODULES.policy.layers) {
      if (!firstLanding || activeLayers.length === 0) {
        onSetLayers(MODULES.policy.layers);
      }
    }
    if (firstLanding) {
      onSetLanding();
    }
  }, []);

  // unhide layer info
  useEffect(() => {
    onHideLayerInfo();
    if (info === '' && show) {
      onShow(true, uiURL);
    }
  }, []);

  // set feature layer info if unset (ie after closing other layerinfo)
  useEffect(() => {
    if (info === '') {
      onSetLayerInfo(viewMemo || MODULES.policy.featuredLayer);
    }
  }, [info]);

  // remember active layers and current info view (featured layer only)
  useEffect(() => {
    let newUIState = {};
    if (layerId === MODULES.policy.featuredLayer) {
      newUIState = Object.assign({}, { viewMemo: info });
    }
    newUIState = Object.assign({}, newUIState, {
      layersMemo: activeLayers,
    });
    onMemo(newUIState, uiState);
  }, [activeLayers, info]);

  // const [show, setShow] = useState(true);
  // const [showSmall, setShowSmall] = useState(true);
  //
  // // also show panel when info set for featured layer
  // const showPanel = show || info === MODULES.policy.featuredLayer;
  // const showPanelSmall = showSmall || info === MODULES.policy.featuredLayer;

  // <ResponsiveContext.Consumer>
  // {size => (
  const isModuleInfo = startsWith(info, MODULES.policy.featuredLayer);
  return (
    <div>
      <Helmet>
        <title>{`${intl.formatMessage(
          commonMessages.module_explore_metaTitle,
        )}`}</title>
      </Helmet>
      <ModuleWrap>
        <Buttons>
          <ShowButton
            onClick={() => {
              onShow(true, uiURL);
            }}
            icon={<Policy color="white" size="26px" />}
            label={<FormattedMessage {...messages.showLayerPanel} />}
          />
        </Buttons>
        {show && (
          <LayerInfo
            isModule
            view={isModuleInfo ? info : MODULES.policy.featuredLayer}
            onClose={() => onShow(false, uiURL)}
            currentModule={MODULES.policy}
          />
        )}
      </ModuleWrap>
    </div>
  );
}
// )}
// </ResponsiveContext.Consumer>

ModulePolicy.propTypes = {
  layerIds: PropTypes.array,
  onSetLayers: PropTypes.func,
  onMemo: PropTypes.func,
  onSetLanding: PropTypes.func,
  activeLayers: PropTypes.array,
  uiState: PropTypes.object,
  uiURL: PropTypes.object,
  firstLanding: PropTypes.bool,
  infoVisible: PropTypes.bool,
  info: PropTypes.string,
  onSetLayerInfo: PropTypes.func,
  onHideLayerInfo: PropTypes.func,
  onShow: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layerIds: state => selectActiveLayers(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
  firstLanding: state => selectFirstLanding(state),
  info: state => selectInfoSearch(state),
  uiURL: state => selectUIURLByKey(state, { key: COMPONENT_KEY }),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLanding: () => dispatch(setLanding()),
    onSetLayers: layers => dispatch(setLayers(layers)),
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
    onShow: (show, uiURL) =>
      dispatch(
        setUIURL(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_URL_STATE, uiURL, { show }),
        ),
      ),
    onHideLayerInfo: () => dispatch(showLayerInfoModule(false)),
    onMemo: (newUIState, uiState) => {
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, newUIState),
        ),
      );
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ModulePolicy));
// export default ModuleExplore;
