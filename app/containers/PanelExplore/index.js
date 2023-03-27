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
import {
  Box,
  Button,
  Text,
  Heading,
  Paragraph,
  ResponsiveContext,
} from 'grommet';
import { Close, ExploreS as Layer } from 'components/Icons';
import { getAsideWidth } from 'utils/responsive';
import { sortLabels, startsWith } from 'utils/string';
import qe from 'utils/quasi-equals';

import { DEFAULT_LOCALE } from 'i18n';

import {
  selectLayersConfig,
  selectConfigByKey,
  selectExploreConfig,
  selectLocale,
  selectUIURLByKey,
  selectActiveLayers,
} from 'containers/App/selectors';
import {
  setUIURL,
  setLayerInfo,
  toggleLayer,
  setLayers,
  showLayerInfoModule,
} from 'containers/App/actions';

import {
  PROJECT_CATEGORY,
  POLICY_CATEGORY,
  POLICY_LAYER,
  PROJECT_CONFIG,
} from 'config';

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

const PanelHeader = styled(p => (
  <Box
    background="brand"
    justify="between"
    {...p}
    elevation="small"
    responsive={false}
  />
))`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 140px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: 150px;
  }
`;
const PanelBody = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 150px;
  width: 100%;
  bottom: 0;
  padding: 12px 12px 96px;
  overflow-y: scroll;
`;
const TitleWrap = styled(p => (
  <Box margin={{ top: 'medium' }} {...p} align="center" responsive={false} />
))``;
const Title = styled(Text)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
`;
const Tabs = styled(p => <Box {...p} direction="row" gap="xsmall" />)``;
const TabLinkWrapper = styled(p => <Box {...p} margin={{ left: 'xsmall' }} />)`
  position: relative;
`;

const TabLink = styled(p => <Button plain {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  line-height: 1;
  padding: 0 ${({ theme }) => theme.global.edgeSize.ms};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'white' : 'brandLight']};
  opacity: 1;
  border-bottom: 4px solid;
  border-color: ${({ theme, active }) =>
    active ? theme.global.colors.white : 'transparent'};
  &:hover {
    color: ${({ theme }) => theme.global.colors.white};
  }
`;
const TabLinkAnchor = styled(p => <Text size="xlarge" {...p} />)``;

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

const ButtonClose = styled(p => (
  <Button icon={<Close />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 10px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.brandDark};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDarker};
  }
`;

const COMPONENT_KEY = 'px';

const DEFAULT_UI_URL_STATE = {
  tab: 0,
};

const getLayersForTab = (tabId, layers, layersConfig) => {
  if (layers.length > 0) {
    if (tabId === PROJECT_CATEGORY) {
      return layers.filter(layer => startsWith(layer, `${PROJECT_CONFIG.id}-`));
    }
    if (tabId === POLICY_CATEGORY) {
      return layers.filter(layer => startsWith(layer, POLICY_LAYER));
    }
    if (layersConfig) {
      return layers.filter(layer => {
        const layerConfig = layersConfig.find(lc => lc.id === layer);
        return layerConfig && layerConfig.category === tabId;
      });
    }
  }
  return [];
};

const sortProjects = (projects, locale) =>
  [...projects].sort((a, b) => {
    const titleA =
      a[`project_title_${locale}`] || a[`project_title_${DEFAULT_LOCALE}`];
    const titleB =
      b[`project_title_${locale}`] || b[`project_title_${DEFAULT_LOCALE}`];
    return sortLabels(titleA, titleB);
  });

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
    ? Object.assign({}, DEFAULT_UI_URL_STATE, uiState)
    : DEFAULT_UI_URL_STATE;
  const cRef = useRef();
  useEffect(() => {
    cRef.current.scrollTop = 0;
  }, [uiState]);

  const activeCategory = exploreConfig && exploreConfig[tab];
  const activeTabLayers =
    activeCategory &&
    getLayersForTab(activeCategory.id, activeLayers, layersConfig);

  const otherTabLayers =
    activeTabLayers &&
    activeLayers.filter(layerId => activeTabLayers.indexOf(layerId) === -1);

  const isProjectTab = activeCategory && activeCategory.id === PROJECT_CATEGORY;
  const isPolicyTab = activeCategory && activeCategory.id === POLICY_CATEGORY;

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideWidth(size)}>
          <div>
            <PanelHeader>
              <ButtonClose onClick={() => onClose()} />
              <TitleWrap>
                <Layer />
                <Title>
                  <FormattedMessage {...messages.title} />
                </Title>
              </TitleWrap>
              <Tabs>
                {layersConfig &&
                  exploreConfig &&
                  exploreConfig.map((category, index) => {
                    const activeCategoryLayers = getLayersForTab(
                      category.id,
                      activeLayers,
                      layersConfig,
                    );
                    const keepLayers =
                      activeCategoryLayers
                        ? activeLayers.filter(
                          l => activeCategoryLayers.indexOf(l) === -1
                        )
                        : [];
                    return (
                      <TabLinkWrapper key={category.id}>
                        {activeCategoryLayers.length > 0 && (
                          <ButtonDeleteLayers
                            updateLayers={() => onSetLayers(keepLayers)}
                            layerCount={activeCategoryLayers.length}
                            active={qe(tab, index)}
                          />
                        )}
                        <TabLink
                          onClick={() => onSetTab(index, uiState)}
                          active={qe(tab, index)}
                          disabled={qe(tab, index)}
                          label={
                            <TabLinkAnchor active={qe(tab, index)}>
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
              {!isPolicyTab &&
                layersConfig &&
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
                    {!isProjectTab && (
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
                    {isProjectTab && (
                      <GroupLayers
                        group={group}
                        projects
                        layersConfig={sortProjects(projects, locale)}
                        locale={locale}
                        activeLayers={activeLayers}
                        onLayerInfo={onLayerInfo}
                        onToggleLayer={onToggleLayer}
                      />
                    )}
                  </SectionLayerGroup>
                ))}
              {!isProjectTab &&
                isPolicyTab &&
                layersConfig &&
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
                    <GroupLayers
                      group={group}
                      showArchived={group.id === 'archive'}
                      layersConfig={layersConfig.filter(layer =>
                        layer.category === activeCategory.id
                      )}
                      isPolicy
                      locale={locale}
                      activeLayers={activeLayers}
                      onLayerInfo={onLayerInfo}
                      onToggleLayer={id => {
                        onSetLayers(activeLayers.indexOf(id) > -1
                          ? otherTabLayers // remove all active group layers
                          : [...otherTabLayers, id] // add while removing other active group layers
                        )
                      }}
                    />
                  </SectionLayerGroup>
                ))}
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
  uiState: state => selectUIURLByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetTab: (tab, uiState) =>
      dispatch(
        setUIURL(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_URL_STATE, uiState, { tab }),
        ),
      ),
    onLayerInfo: id => {
      dispatch(setLayerInfo(id));
      dispatch(showLayerInfoModule());
    },
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
