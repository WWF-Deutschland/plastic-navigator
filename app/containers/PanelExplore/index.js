/**
 *
 * PanelExplore
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  Box,
  Button,
  Text,
  Heading,
  Paragraph,
  ResponsiveContext,
} from 'grommet';
import { Close, Layer } from 'grommet-icons';

import { getAsideWidth } from 'utils/responsive';

import { DEFAULT_LOCALE } from 'i18n';

import {
  selectLayersConfig,
  selectConfigByKey,
  selectExploreConfig,
  selectLocale,
  selectUIStateByKey,
  selectActiveLayers,
} from 'containers/App/selectors';
import {
  setUIState,
  setLayerInfo,
  toggleLayer,
  setLayers,
} from 'containers/App/actions';

import { PROJECT_CATEGORY } from 'config';

import GroupLayers from 'components/GroupLayers';

import messages from './messages';
// import commonMessages from 'messages';

const Styled = styled(props => <Box {...props} elevation="medium" />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: ${({ panelWidth }) => panelWidth || 400}px;
  pointer-events: all;
  overflow-y: auto;
`;

const PanelHeader = styled(p => <Box background="black" {...p} />)``;
const PanelBody = styled(p => <Box {...p} pad="small" />)``;
const TitleWrap = styled(p => (
  <Box {...p} pad={{ horizontal: 'small', bottom: 'small' }} />
))``;
const Title = styled(Text)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const Tabs = styled(p => <Box {...p} direction="row" gap="hair" />)`
  padding: 1px;
`;
const TabLink = styled(p => <Button plain {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 0.05em;
  padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'white' : 'light-4']};
  opacity: 1;
  border-bottom: 3px solid;
  border-color: ${({ theme, active }) =>
    active ? theme.global.colors.white : 'transparent'};
`;
const TabLinkAnchor = styled(Text)``;

const SectionLayerGroup = styled(Box)``;
const TitleGroup = styled(p => <Heading {...p} level={4} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 0.05em;
  margin-bottom: 0;
`;
const DescriptionGroup = styled(Paragraph)`
  margin-bottom: 0;
`;

const COMPONENT_KEY = 'PanelExplore';

const DEFAULT_UI_STATE = {
  tab: 0,
  layersMemo: null,
  prrojectsMemo: null,
};

export function PanelExplore({
  onClose,
  onLayerInfo,
  onToggleLayer,
  onSetLayers,
  onMemoLayers,
  onSetTab,
  projects,
  layersConfig,
  exploreConfig,
  locale,
  uiState,
  activeLayers,
}) {
  const { tab, layersMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  useEffect(() => {
    if (layersMemo && (!activeLayers || activeLayers.length === 0)) {
      onSetLayers(layersMemo);
    }
  }, []);
  useEffect(() => {
    onMemoLayers(activeLayers, uiState);
  }, [activeLayers]);

  const activeCategory = exploreConfig && exploreConfig[tab];

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideWidth(size)}>
          <div>
            <PanelHeader>
              <Button
                onClick={() => onClose()}
                icon={<Close size="xlarge" />}
                plain
                alignSelf="end"
              />
              <TitleWrap>
                <Layer size="xlarge" />
                <Title>
                  <FormattedMessage {...messages.title} />
                </Title>
              </TitleWrap>
              <Tabs>
                {exploreConfig &&
                  exploreConfig.map((category, index) => (
                    <TabLink
                      key={category.id}
                      onClick={() => onSetTab(index, uiState)}
                      active={tab === index}
                      disabled={tab === index}
                      label={
                        <TabLinkAnchor active={tab === index}>
                          {category.title[locale] || category.title[DEFAULT_LOCALE]}
                        </TabLinkAnchor>
                      }
                    />
                  ))}
              </Tabs>
            </PanelHeader>
            <PanelBody>
              {layersConfig &&
                activeCategory &&
                activeCategory.id !== PROJECT_CATEGORY &&
                activeCategory.groups &&
                activeCategory.groups.map(group => (
                  <SectionLayerGroup key={group.id}>
                    <TitleGroup>
                      {group.title[locale] || group.title[DEFAULT_LOCALE]}
                    </TitleGroup>
                    {group.description && (
                      <DescriptionGroup>
                        {group.description[locale] ||
                          group.description[DEFAULT_LOCALE]}
                      </DescriptionGroup>
                    )}
                    <GroupLayers
                      group={group}
                      layers={layersConfig.filter(layer =>
                        layer.category === activeCategory.id &&
                        layer.group === group.id
                      )}
                      locale={locale}
                      activeLayers={activeLayers}
                      onLayerInfo={onLayerInfo}
                      onToggleLayer={onToggleLayer}
                    />
                  </SectionLayerGroup>
                ))}
              {layersConfig &&
                activeCategory &&
                activeCategory.id !== PROJECT_CATEGORY &&
                !activeCategory.groups && (
                <SectionLayerGroup>
                  <GroupLayers
                    group={activeCategory}
                    layers={layersConfig.filter(
                      layer => layer.category === activeCategory.id,
                    )}
                    locale={locale}
                    activeLayers={activeLayers}
                    onLayerInfo={onLayerInfo}
                    onToggleLayer={onToggleLayer}
                  />
                </SectionLayerGroup>
              )}
              {projects &&
                activeCategory &&
                activeCategory.id === PROJECT_CATEGORY && (
                <SectionLayerGroup>
                  <GroupLayers
                    group={activeCategory.id}
                    layers={projects}
                    projects
                    locale={locale}
                    activeLayers={activeLayers}
                    onLayerInfo={onLayerInfo}
                    onToggleLayer={onToggleLayer}
                  />
                </SectionLayerGroup>
              )}
            </PanelBody>
          </div>
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

PanelExplore.propTypes = {
  onClose: PropTypes.func,
  onSetTab: PropTypes.func,
  onLayerInfo: PropTypes.func,
  onToggleLayer: PropTypes.func,
  onSetLayers: PropTypes.func,
  onMemoLayers: PropTypes.func,
  layersConfig: PropTypes.array,
  exploreConfig: PropTypes.array,
  projects: PropTypes.array,
  activeLayers: PropTypes.array,
  locale: PropTypes.string,
  uiState: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  projects: state => selectConfigByKey(state, { key: 'projects' }),
  layersConfig: state => selectLayersConfig(state),
  exploreConfig: state => selectExploreConfig(state),
  locale: state => selectLocale(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetTab: (tab, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { tab }),
        ),
      ),
    onMemoLayers: (layers, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { layersMemo: layers }),
        ),
      ),
    onMemoProjects: (projects, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, {
            projectsMemo: projects,
          }),
        ),
      ),
    onLayerInfo: id => dispatch(setLayerInfo(id)),
    onToggleLayer: id => dispatch(toggleLayer(id)),
    onSetLayers: layers => dispatch(setLayers(layers)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelExplore);
// export default PanelExplore;
