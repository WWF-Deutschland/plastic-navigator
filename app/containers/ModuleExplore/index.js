/**
 *
 * ModuleExplore
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, ResponsiveContext, Layer } from 'grommet';
import { Layer as LayerIcon } from 'grommet-icons';
import { uniq } from 'lodash/array';
import { startsWith } from 'utils/string';

import PanelExplore from 'containers/PanelExplore';
import ModuleWrap from 'components/ModuleWrap';

import {
  selectConfigByKey,
  selectActiveLayers,
} from 'containers/App/selectors';
import { setLayers } from 'containers/App/actions';

import { getAsideWidth } from 'utils/responsive';

import messages from './messages';
// import commonMessages from 'messages';

const Buttons = styled(props => <Box {...props} direction="row" />)`
  position: absolute;
  right: 20px;
  top: 20px;
  pointer-events: all;
`;

const ShowButton = styled(p => <Button plain reverse {...p} />)`
  background: ${({ theme }) => theme.global.colors.black};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 20px;
  padding: 5px 15px;
`;

const ProjectButtonWrap = styled.div`
  position: absolute;
  right: ${({ asideOffset }) => asideOffset + 20}px;
  top: 20px;
  pointer-events: all;
`;

const ProjectButton = ({ showAll, lids, pids, onClick }) => (
  <ShowButton
    onClick={() => {
      if (showAll) {
        onClick(uniq([...lids, ...pids.map(pid => `project-${pid}`)]));
      } else {
        onClick(lids.filter(id => !startsWith(id, 'project-')));
      }
    }}
    label={
      showAll ? (
        <FormattedMessage {...messages.showProjects} />
      ) : (
        <FormattedMessage {...messages.hideProjects} />
      )
    }
  />
);

ProjectButton.propTypes = {
  lids: PropTypes.array,
  pids: PropTypes.array,
  onClick: PropTypes.func,
  showAll: PropTypes.bool,
};

export function ModuleExplore({ onSetLayers, layerIds, projects }) {
  const [show, setShow] = useState(true);
  const [showSmall, setShowSmall] = useState(false);

  const projectIds = projects ? projects.map(p => p.project_id) : [];
  const activeProjects = layerIds
    .filter(id => {
      if (startsWith(id, 'project-')) {
        const pid = id.replace('project-', '');
        return projectIds.indexOf(pid) > -1;
      }
      return false;
    })
    .map(id => id.replace('project-', ''));
  // const hasActiveProjects = activeProjects.length > 0;
  const hasAllProjectsActive =
    projects && activeProjects.length >= projects.length;
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <div>
          <Helmet>
            <title>ModuleExplore</title>
            <meta name="description" content="Description of ModuleExplore" />
          </Helmet>
          <ModuleWrap>
            {show && size !== 'small' && (
              <ProjectButtonWrap asideOffset={getAsideWidth(size)}>
                <ProjectButton
                  showAll={!hasAllProjectsActive}
                  lids={layerIds}
                  pids={projectIds}
                  onClick={onSetLayers}
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
                <ProjectButton
                  showAll={!hasAllProjectsActive}
                  lids={layerIds}
                  pids={projectIds}
                  onClick={onSetLayers}
                />
                <ShowButton
                  onClick={() => {
                    setShow(true);
                    setShowSmall(true);
                  }}
                  icon={<LayerIcon color="white" />}
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
};

const mapStateToProps = createStructuredSelector({
  layerIds: state => selectActiveLayers(state),
  projects: state => selectConfigByKey(state, { key: 'projects' }),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLayers: layers => {
      dispatch(setLayers(layers));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ModuleExplore);
// export default ModuleExplore;
