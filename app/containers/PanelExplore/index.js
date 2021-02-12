/**
 *
 * PanelExplore
 *
 */

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Heading, Paragraph, ResponsiveContext } from 'grommet';
import { ExploreS as Layer } from 'components/Icons';
import { deburr } from 'lodash/string';
import { getAsideWidth } from 'utils/responsive';
import { lowerCase, startsWith } from 'utils/string';

import { DEFAULT_LOCALE } from 'i18n';

import Tabs from 'components/Tabs';
import TabLink from 'components/TabLink';
import TabLinkWrapper from 'components/TabLinkWrapper';
import TabLinkAnchor from 'components/TabLinkAnchor';
import PanelHeader from 'components/PanelHeader';
import PanelTitle from 'components/PanelTitle';
import PanelTitleWrap from 'components/PanelTitleWrap';
import PanelBody from 'components/PanelBody';
import ButtonPanelClose from 'components/ButtonPanelClose';

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

import { PROJECT_CATEGORY, PROJECT_CONFIG } from 'config';

import GroupLayers from 'components/GroupLayers';
import ButtonDeleteLayers from './ButtonDeleteLayers';

import messages from './messages';
// import commonMessages from 'messages';

const Styled = styled(props => <Box {...props} elevation="medium" />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  pointer-events: all;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: ${({ panelWidth }) => panelWidth || 400}px;
  }
`;

const SectionLayerGroup = styled(p => <Box flex={{ shrink: 0 }} {...p} />)``;
const TitleGroup = styled(p => <Heading {...p} level={3} />)`
  font-family: 'wwfregular';
  font-weight: normal;
  margin-bottom: 0;
  letter-spacing: 0.1px;
  font-size: 28px;
  line-height: 29px;
`;
const DescriptionGroup = styled(Paragraph)`
  margin-bottom: 8px;
`;

const COMPONENT_KEY = 'PanelExplore';

const DEFAULT_UI_STATE = {
  tab: 0,
};

export function PanelExplore({
  onClose,
  onLayerInfo,
  onToggleLayer,
  onSetTab,
  projects,
  layersConfig,
  exploreConfig,
  locale,
  uiState,
  activeLayers,
  onSetLayers,
}) {
  const { tab } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;

  const cRef = useRef();
  useEffect(() => {
    cRef.current.scrollTop = 0;
  }, [uiState]);

  const activeCategory = exploreConfig && exploreConfig[tab];

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideWidth(size)}>
          <div>
            <PanelHeader>
              <ButtonPanelClose onClick={() => onClose()} />
              <PanelTitleWrap>
                <Layer />
                <PanelTitle>
                  <FormattedMessage {...messages.title} />
                </PanelTitle>
              </PanelTitleWrap>
              <Tabs>
                {layersConfig &&
                  exploreConfig &&
                  exploreConfig.map((category, index) => {
                    let activeCategoryLayers = [];
                    if (activeLayers.length > 0) {
                      if (PROJECT_CATEGORY === category.id) {
                        activeCategoryLayers = activeLayers.filter(
                          layer => startsWith(layer, `${PROJECT_CONFIG.id}-`),
                        );
                      } else {
                        activeCategoryLayers = activeLayers.filter(layer => {
                          const layerConfig = layersConfig.find(lc => lc.id === layer);
                          return layerConfig && layerConfig.category === category.id;
                        });
                      }
                    }
                    const keepLayers = activeLayers.filter(
                      l => activeCategoryLayers.indexOf(l) === -1
                    );
                    return (
                      <TabLinkWrapper key={category.id}>
                        {activeCategoryLayers.length > 0 && (
                          <ButtonDeleteLayers
                            updateLayers={() => onSetLayers(keepLayers)}
                            layerCount={activeCategoryLayers.length}
                            active={tab === index}
                          />
                        )}
                        <TabLink
                          onClick={() => onSetTab(index, uiState)}
                          active={tab === index}
                          disabled={tab === index}
                          label={
                            <TabLinkAnchor active={tab === index}>
                              {category.title[locale] || category.title[DEFAULT_LOCALE]}
                            </TabLinkAnchor>
                          }
                        />
                      </TabLinkWrapper>
                    );
                  })}
              </Tabs>
            </PanelHeader>
            <PanelBody ref={cRef}>
              {layersConfig &&
                activeCategory &&
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
                    { activeCategory.id !== PROJECT_CATEGORY && (
                      <GroupLayers
                        group={group}
                        layersConfig={layersConfig.filter(layer =>
                          layer.category === activeCategory.id &&
                          layer.group === group.id
                        )}
                        locale={locale}
                        activeLayers={activeLayers}
                        onLayerInfo={onLayerInfo}
                        onToggleLayer={onToggleLayer}
                      />
                    )}
                    {projects &&
                      activeCategory &&
                      activeCategory.id === PROJECT_CATEGORY && (
                      <GroupLayers
                        group={activeCategory.id}
                        layersConfig={
                          [...projects].sort((a, b) => {
                            const titleA =
                              a[`project_title_${locale}`] ||
                              a[`project_title_${DEFAULT_LOCALE}`];
                            const titleB =
                              b[`project_title_${locale}`] ||
                              b[`project_title_${DEFAULT_LOCALE}`];
                            return deburr(lowerCase(titleA)) > deburr(lowerCase(titleB)) ? 1 : -1;
                          })
                        }
                        projects
                        locale={locale}
                        activeLayers={activeLayers}
                        onLayerInfo={onLayerInfo}
                        onToggleLayer={onToggleLayer}
                      />
                    )}
                  </SectionLayerGroup>
                ))}
              {layersConfig &&
                activeCategory &&
                activeCategory.id !== PROJECT_CATEGORY &&
                !activeCategory.groups && (
                <SectionLayerGroup>
                  <GroupLayers
                    group={activeCategory}
                    layersConfig={layersConfig.filter(
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
                activeCategory.id === PROJECT_CATEGORY &&
                !activeCategory.groups && (
                <SectionLayerGroup>
                  <GroupLayers
                    group={activeCategory.id}
                    layersConfig={projects}
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
  onSetLayers: PropTypes.func,
  onToggleLayer: PropTypes.func,
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
    onLayerInfo: id => dispatch(setLayerInfo(id)),
    onSetLayers: layers => dispatch(setLayers(layers)),
    onToggleLayer: id => dispatch(toggleLayer(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelExplore);
// export default PanelExplore;
