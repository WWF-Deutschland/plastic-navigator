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
import { ExploreS } from 'components/Icons';

import {
  selectActiveLayers,
  selectUIStateByKey,
  selectFirstLanding,
  selectInfoSearch,
} from 'containers/App/selectors';
import {
  setLayers,
  setUIState,
  setLanding,
  setLayerInfo,
  setLayerInfoHidden,
} from 'containers/App/actions';

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

const COMPONENT_KEY = 'ModulePolicy';

const DEFAULT_UI_STATE = {
  layersMemo: null,
};

export function ModulePolicy({
  onSetLayers,
  uiState,
  onMemoLayers,
  activeLayers,
  firstLanding,
  onSetLanding,
  intl,
  onSetLayerInfo,
  onShowLayerInfo,
  info,
}) {
  const { layersMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  useEffect(() => {
    if (layersMemo) {
      onSetLayers(layersMemo);
    } else if (MODULES.policy.layers && !firstLanding) {
      onSetLayers(MODULES.policy.layers);
    }
    if (firstLanding) {
      onSetLanding();
    }
  }, []);
  useEffect(() => {
    onMemoLayers(activeLayers, uiState);
  }, [activeLayers]);

  // open feature layer info
  useEffect(() => {
    if (info === '') {
      onSetLayerInfo(MODULES.policy.featuredLayer);
    }
  }, [info]);
  // open feature layer info
  useEffect(() => {
    if (info === '') {
      onShowLayerInfo();
    }
  }, []);

  // const [show, setShow] = useState(true);
  // const [showSmall, setShowSmall] = useState(true);
  //
  // // also show panel when info set for featured layer
  // const showPanel = show || info === MODULES.policy.featuredLayer;
  // const showPanelSmall = showSmall || info === MODULES.policy.featuredLayer;

  // <ResponsiveContext.Consumer>
  // {size => (
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
              onSetLayerInfo(MODULES.policy.featuredLayer);
              onShowLayerInfo();
            }}
            icon={<ExploreS color="white" />}
            label={<FormattedMessage {...messages.showLayerPanel} />}
          />
        </Buttons>
      </ModuleWrap>
    </div>
  );
}
// )}
// </ResponsiveContext.Consumer>

ModulePolicy.propTypes = {
  layerIds: PropTypes.array,
  onSetLayers: PropTypes.func,
  onMemoLayers: PropTypes.func,
  onSetLanding: PropTypes.func,
  activeLayers: PropTypes.array,
  uiState: PropTypes.object,
  firstLanding: PropTypes.bool,
  info: PropTypes.string,
  onSetLayerInfo: PropTypes.func,
  onShowLayerInfo: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layerIds: state => selectActiveLayers(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
  firstLanding: state => selectFirstLanding(state),
  info: state => selectInfoSearch(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLanding: () => dispatch(setLanding()),
    onSetLayers: layers => dispatch(setLayers(layers)),
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
    onShowLayerInfo: () => {
      dispatch(setLayerInfoHidden(false));
    },
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

export default compose(withConnect)(injectIntl(ModulePolicy));
// export default ModuleExplore;
