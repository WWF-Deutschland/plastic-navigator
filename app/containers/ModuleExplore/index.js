/**
 *
 * ModuleExplore
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
import { uniq } from 'lodash/array';
import { startsWith } from 'utils/string';
import { getAsideWidth, isMaxSize } from 'utils/responsive';

import { PROJECT_CONFIG, MODULES } from 'config';

import PanelExplore from 'containers/PanelExplore';
import ModuleWrap from 'components/ModuleWrap';
import { ExploreS, WWFLogoSmall } from 'components/Icons';

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

const ProjectButtonWrap = styled.div`
  position: absolute;
  right: ${({ asideOffset }) => asideOffset + 20}px;
  top: 20px;
  pointer-events: all;
`;

const ProjectButton = ({ showAll, lids, pids, onClick, small, ...rest }) => {
  let label = '';

  if (small) {
    label = showAll ? messages.showProjectsShort : messages.hideProjectsShort;
  } else {
    label = showAll ? messages.showProjects : messages.hideProjects;
  }
  return (
    <ShowButton
      projects
      onClick={() => {
        if (showAll) {
          onClick(
            uniq([...lids, ...pids.map(pid => `${PROJECT_CONFIG.id}-${pid}`)]),
          );
        } else {
          onClick(lids.filter(id => !startsWith(id, `${PROJECT_CONFIG.id}-`)));
        }
      }}
      label={<FormattedMessage {...label} />}
      {...rest}
    />
  );
};

ProjectButton.propTypes = {
  lids: PropTypes.array,
  pids: PropTypes.array,
  onClick: PropTypes.func,
  showAll: PropTypes.bool,
  small: PropTypes.bool,
};

const COMPONENT_KEY = 'ModuleExplore';

const DEFAULT_UI_STATE = {
  layersMemo: null,
};

export function ModuleExplore({
  onSetLayers,
  layerIds,
  projects,
  uiState,
  onMemoLayers,
  activeLayers,
  firstLanding,
  onSetLanding,
  intl,
}) {
  const { layersMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  useEffect(() => {
    if (layersMemo) {
      onSetLayers(layersMemo);
    } else if (MODULES.explore.layers) {
      if (!firstLanding || activeLayers.length === 0) {
        onSetLayers(MODULES.explore.layers);
      }
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

  const projectIds = projects ? projects.map(p => p.project_id) : [];
  const activeProjects = layerIds
    .filter(id => {
      if (startsWith(id, `${PROJECT_CONFIG.id}-`)) {
        const pid = id.replace(`${PROJECT_CONFIG.id}-`, '');
        return projectIds.indexOf(pid) > -1;
      }
      return false;
    })
    .map(id => id.replace(`${PROJECT_CONFIG.id}-`, ''));
  // const hasActiveProjects = activeProjects.length > 0;
  const hasAllProjectsActive =
    projects && activeProjects.length >= projects.length;
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <div>
          <Helmet>
            <title>{`${intl.formatMessage(
              commonMessages.module_explore_metaTitle,
            )}`}</title>
          </Helmet>
          <ModuleWrap>
            {show && size !== 'small' && (
              <ProjectButtonWrap asideOffset={getAsideWidth(size)}>
                <ProjectButton
                  showAll={!hasAllProjectsActive}
                  lids={layerIds}
                  pids={projectIds}
                  onClick={onSetLayers}
                  small={isMaxSize(size, 'small')}
                  icon={<WWFLogoSmall color="black" />}
                />
              </ProjectButtonWrap>
            )}
            {show && size !== 'small' && (
              <PanelExplore onClose={() => setShow(false)} />
            )}
            {showSmall && size === 'small' && (
              <Layer full>
                <PanelExplore onClose={() => setShowSmall(false)} />
              </Layer>
            )}
            {((!show && size !== 'small') ||
              (!showSmall && size === 'small')) && (
              <Buttons>
                {size !== 'small' && (
                  <ProjectButton
                    showAll={!hasAllProjectsActive}
                    lids={layerIds}
                    pids={projectIds}
                    onClick={onSetLayers}
                    small={isMaxSize(size, 'small')}
                    icon={<WWFLogoSmall color="black" />}
                  />
                )}
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

ModuleExplore.propTypes = {
  layerIds: PropTypes.array,
  projects: PropTypes.array,
  onSetLayers: PropTypes.func,
  onMemoLayers: PropTypes.func,
  onSetLanding: PropTypes.func,
  activeLayers: PropTypes.array,
  uiState: PropTypes.object,
  firstLanding: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layerIds: state => selectActiveLayers(state),
  projects: state => selectConfigByKey(state, { key: 'projects' }),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
  firstLanding: state => selectFirstLanding(state),
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

export default compose(withConnect)(injectIntl(ModuleExplore));
// export default ModuleExplore;
