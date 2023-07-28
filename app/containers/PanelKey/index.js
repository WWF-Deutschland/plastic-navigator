/**
 *
 * Key
 *
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, Text, ResponsiveContext } from 'grommet';
import Markdown from 'react-remarkable';

import {
  Expand,
  Collapse,
  ArrowDown,
  ArrowUp,
  InfoSolid as Info,
} from 'components/Icons';

import { PROJECT_CONFIG, POLICY_LAYER } from 'config';

import { startsWith, prepMarkdown } from 'utils/string';
import { isMaxSize, isMinSize } from 'utils/responsive';

import {
  selectUIStateByKey,
  selectChartDate,
  selectLayerGeometries,
} from 'containers/App/selectors';
import {
  setUIState,
  setLayerInfo,
  showLayerInfoModule,
  setLayerGeometries,
} from 'containers/App/actions';

import KeyIcon from 'components/KeyIcon';
import KeyFull from 'components/KeyFull';

// import commonMessages from 'messages';
import LayerSettings from './LayerSettings';
import LayerButtonInfo from './LayerButtonInfo';
import { getLayerTitle, getLayerAbout } from './utils';
import messages from './messages';

// prettier-ignore
const KeyScrollButton = styled(p => (
  <Button plain {...p} />
))`
  z-index: 10;
  width: 40px;
  height: 30px;
  background: ${({ theme }) => theme.global.colors.white};
  position: absolute;
  top: ${({ top }) => (top ? 0 : 'auto')};
  bottom: ${({ top }) => (!top ? 0 : 'auto')};
  left: 0;
  right: 0;
  text-align: center;
  box-shadow: ${({ top }) => top
    ? '0px 2px 6px rgba(0, 0, 0, 0.1)'
    : '0px -2px 6px rgba(0, 0, 0, 0.1)'};
  border-top: 1px solid;
  border-color: ${({ top, theme }) =>
    top ? theme.global.colors.light : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.global.colors.lightHover};
  }
`;

const Styled = styled(p => <Box {...p} direction="row" gap="hair" />)`
  position: absolute;
  left: 0;
  bottom: 35px;
  height: 200px;
  pointer-events: all;
  z-index: 1999;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    bottom: 40px;
  }
`;

const ToggleWrap = styled(p => (
  <Box
    {...p}
    fill="vertical"
    align="center"
    background="white"
    elevation="small"
    flex={{ shrink: 0 }}
    responsive={false}
  />
))`
  width: 40px;
  overflow: hidden;
  position: relative;
  z-index: 3;
`;
const ButtonToggleWrap = styled.div`
  height: 40px;
  width: 40px;
`;
const ButtonToggle = styled(p => <Button {...p} plain fill="horizontal" />)`
  height: 40px;
  width: 40px;
  text-align: center;
  &:hover {
    background: ${({ theme }) => theme.global.colors.lightHover};
  }
`;
const ButtonTab = styled(p => <Button {...p} plain />)`
  text-decoration: ${({ activeTab }) => (activeTab ? 'underline' : 'none')};
  opacity: ${({ activeTab }) => (activeTab ? 1 : 0.5)};
  cursor: ${({ activeTab }) => (activeTab ? 'default' : 'pointer')};
  &:hover {
    opacity: 1;
  }
`;
const KeyUL = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1px 0 0 0;
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ offset }) => -1 * offset || 0}px;
`;
const KeyLI = styled.li`
  height: 40px;
  width: 40px;
  display: block;
`;
// prettier-ignore
const ButtonKey = styled(p => <Button {...p} plain fill />)`
  background: ${({ activeLayer, theme }) =>
    theme.global.colors[activeLayer ? 'lightHover' : 'white']};
  padding: 5px;
  opacity: 1;
  &:hover {
    background: ${({ theme, activeLayer }) =>
    theme.global.colors[activeLayer ? 'light-4' : 'lightHover']};
  }
`;

const Tab = styled(p => <Box flex={false} {...p} />)``;

const ContentWrap = styled(p => (
  <Box {...p} direction="row" gap="hair" fill="horizontal" />
))`
  position: relative;
`;
const Content = styled(p => (
  <Box
    background="white-trans"
    pad="small"
    fill="horizontal"
    elevation="medium"
    responsive={false}
    flex={false}
    {...p}
  />
))`
  z-index: 1;
  width: 350px;
  max-width: 100%;
  overflow: hidden;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 300px;
  }
`;

const Description = styled(Text)`
  hyphens: auto;
`;

const LayerTitleWrap = styled(p => (
  <Box
    direction="row"
    align="center"
    margin={{ vertical: 'xsmall' }}
    responsive={false}
    {...p}
  />
))`
  min-height: 20px;
`;

const LayerTitle = styled(p => <Text size="xsmall" {...p} />)`
  font-weight: 700;
`;

const TabLabel = styled(p => <Text size="xxsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: 700;
`;

// figure out how far to scroll down
const getScrollOffsetBottom = (
  itemCount,
  itemHeight,
  maxHeight,
  offset,
  offsetStep,
) => offset + Math.min(offsetStep, itemCount * itemHeight - maxHeight - offset);

// figure out if scrolling down is possible
const hasScrollBottom = (itemCount, itemHeight, maxHeight, offset) =>
  itemCount * itemHeight - maxHeight - offset > 0;

// figure out how far to scroll up
const getScrollOffsetTop = (offset, offsetStep) =>
  offset - Math.min(offsetStep, offset);

// figure out if scrolling up is possible
const hasScrollTop = offset => offset > 0;

const COMPONENT_KEY = 'pkey';

const DEFAULT_UI_STATE = {
  open: true,
};

const OFFSET_STEP = 80;

const MIN_EXPAND = 'xlarge';
const MAX_FOLD = 'large';

export function PanelKey({
  onLayerInfo,
  layersConfig,
  activeLayerIds,
  intl,
  jsonLayers,
  uiState,
  onSetOpen,
  currentModule,
  chartDate,
  layerGeometries,
  onSetLayerGeometries,
}) {
  const { open } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState(0);
  const [activeLength, setActiveLength] = useState(0);

  const [keyIconOffset, setKeyIconOffset] = useState(0);

  const keyULRef = useRef(null);
  const keyWrapperRef = useRef(null);
  const size = React.useContext(ResponsiveContext);
  // update key when new layers are added or previous layer has become invalid
  useEffect(() => {
    if (
      // any manual change will lead to a different number of active layers
      activeLayerIds.length !== activeLength ||
      // programamtic changes may lead an invalid active no longer listed
      activeLayerIds.indexOf(active) < 0
    ) {
      const latestActive = activeLayerIds[0];
      const isProject = startsWith(latestActive, `${PROJECT_CONFIG.id}_`);
      if (isProject) {
        setActive(PROJECT_CONFIG.id);
      } else {
        setActive(latestActive);
      }
      setKeyIconOffset(0);
      setActiveLength(activeLayerIds.length);
    }
  }, [activeLayerIds]);

  const { locale } = intl;
  const allConfig = layersConfig && [...layersConfig, PROJECT_CONFIG];

  const activeContentId = active || activeLayerIds[0];
  let config;
  let indicatorId = null;
  let activeContentIdRoot = null;
  [activeContentIdRoot, indicatorId] = activeContentId.split('_');
  const isActiveProject = startsWith(activeContentId, PROJECT_CONFIG.id);
  const isActivePolicy = startsWith(activeContentId, POLICY_LAYER);
  if (isActiveProject) {
    activeContentIdRoot = PROJECT_CONFIG.id;
    config = PROJECT_CONFIG;
  } else {
    config =
      activeContentIdRoot &&
      allConfig &&
      allConfig.find(l => l.id === activeContentIdRoot);
  }
  let hasAlreadyProject = false;
  const cleanActiveLayerIds =
    activeLayerIds &&
    activeLayerIds.reduce((memo, id) => {
      const isProject = startsWith(id, `${PROJECT_CONFIG.id}_`);
      const cleanId = isProject ? PROJECT_CONFIG.id : id;
      const pass = !isProject || !hasAlreadyProject;
      hasAlreadyProject = hasAlreadyProject || isProject;
      return pass ? [...memo, cleanId] : memo;
    }, []);

  const activeJsonLayerInfo = config ? jsonLayers[config.id] : null;
  const isModuleLayer =
    config &&
    currentModule &&
    currentModule.featuredLayer &&
    (currentModule.featuredLayer === config['content-default'] ||
      currentModule.featuredLayer === config.id);

  const tabAll = isMaxSize(size, MAX_FOLD);
  const keyTabId = 0;
  const aboutTabId = tabAll ? 1 : 2;
  const settingsTabId = tabAll ? 2 : 1;
  const hasSettingsTab = isActivePolicy;
  const hasTabs = tabAll || hasSettingsTab;
  let tabClean = tab;
  if (tab === settingsTabId && !hasSettingsTab) {
    tabClean = 1;
  }
  // prettier-ignore
  return (
    <Styled>
      <ToggleWrap>
        <ButtonToggleWrap>
          <ButtonToggle
            icon={open ? <Collapse /> : <Expand />}
            onClick={() => onSetOpen(!open)}
          />
        </ButtonToggleWrap>
        <Box ref={keyWrapperRef} fill style={{ position: 'relative', overflow: 'hidden' }}>
          {keyULRef.current &&
            keyWrapperRef.current &&
            hasScrollTop(keyIconOffset) && (
            <KeyScrollButton
              icon={<ArrowUp color="dark-4" />}
              top
              onClick={() => setKeyIconOffset(getScrollOffsetTop(
                keyIconOffset,
                OFFSET_STEP,
              ))}
            />
          )}
          {cleanActiveLayerIds.length > 0 && (
            <KeyUL ref={keyULRef} offset={keyIconOffset}>
              {cleanActiveLayerIds.map(id => {
                const [configLayerId] = id.split('_');
                const conf = allConfig && allConfig.find(l => l.id === configLayerId);
                return (
                  <KeyLI key={id}>
                    <ButtonKey
                      activeLayer={open && id.startsWith(activeContentIdRoot)}
                      onClick={() => {
                        onSetOpen(true);
                        setActive(id);
                      }}
                      disabled={open && id.startsWith(activeContentIdRoot)}
                    >
                      {conf && <KeyIcon config={conf} />}
                    </ButtonKey>
                  </KeyLI>
                );
              })}
            </KeyUL>
          )}
          {keyULRef.current &&
            keyWrapperRef.current &&
            hasScrollBottom(
              cleanActiveLayerIds.length,
              40,
              keyWrapperRef.current.clientHeight,
              keyIconOffset,
            ) && (
            <KeyScrollButton
              icon={<ArrowDown color="dark-4" />}
              onClick={() => setKeyIconOffset(getScrollOffsetBottom(
                cleanActiveLayerIds.length,
                40,
                keyWrapperRef.current.clientHeight,
                keyIconOffset,
                OFFSET_STEP,
              ))}
            />
          )}
        </Box>
      </ToggleWrap>
      {open && (
        <ContentWrap>
          <Content
            pad={{
              top: hasTabs ? 'xsmall' : 'small',
              bottom: 'small',
              horizontal: 'small',
            }}
            style={{ zIndex: 2 }}
          >
            {hasTabs && (
              <Box
                direction="row"
                gap="small"
                flex={false}
              >
                <ButtonTab
                  onClick={() => setTab(keyTabId)}
                  label={
                    <TabLabel>
                      <FormattedMessage {...messages.keyTabKey} />
                    </TabLabel>
                  }
                  activeTab={tabClean === keyTabId}
                />
                {tabAll && (
                  <ButtonTab
                    onClick={() => setTab(aboutTabId)}
                    label={
                      <TabLabel>
                        <FormattedMessage {...messages.keyTabAbout} />
                      </TabLabel>
                    }
                    activeTab={tabClean === aboutTabId}
                  />
                )}
                {isActivePolicy && (
                  <ButtonTab
                    onClick={() => setTab(settingsTabId)}
                    label={
                      <TabLabel>
                        <FormattedMessage {...messages.keyTabSettings} />
                      </TabLabel>
                    }
                    activeTab={tabClean === settingsTabId }
                  />
                )}
              </Box>
            )}
            {(tabClean === keyTabId || !hasTabs) && (
              <Tab>
                {config && locale && (
                  <Box flex={false}>
                    {!hasTabs && (
                      <TabLabel>
                        <FormattedMessage {...messages.keyTabKey} />
                      </TabLabel>
                    )}
                    <LayerTitleWrap>
                      <LayerTitle>
                        {isActiveProject ? (
                          <FormattedMessage {...messages.keyProjectsTitle} />
                        ) : (
                          getLayerTitle({
                            intl,
                            config,
                            jsonLayerInfo: activeJsonLayerInfo,
                            indicatorId,
                          })
                        )}
                      </LayerTitle>
                      {!isActiveProject && !isModuleLayer && (
                        <LayerButtonInfo
                          onClick={() => {
                            onLayerInfo(activeContentId);
                          }}
                          icon={<Info />}
                        />
                      )}
                    </LayerTitleWrap>
                    <KeyFull
                      config={config}
                      layerInfo={activeJsonLayerInfo}
                      excludeEmpty
                      indicatorId={indicatorId}
                      chartDate={chartDate}
                    />
                  </Box>
                )}
              </Tab>
            )}
            {hasTabs && tabClean === aboutTabId && (
              <Tab>
                {locale && (
                  <Box flex={false}>
                    <LayerTitleWrap>
                      <LayerTitle>
                        {isActiveProject ? (
                          <FormattedMessage {...messages.keyProjectsTitle} />
                        ) : (
                          getLayerTitle({
                            intl,
                            config,
                            jsonLayerInfo: activeJsonLayerInfo,
                            indicatorId,
                          })
                        )}
                      </LayerTitle>
                      {!isActiveProject && !isModuleLayer && (
                        <LayerButtonInfo
                          onClick={() => {
                            onLayerInfo(activeContentId);
                          }}
                          icon={<Info />}
                        />
                      )}
                    </LayerTitleWrap>
                    <Description className="mpx-wrap-markdown-description">
                      {isActiveProject && (
                        <p><FormattedMessage {...messages.keyProjectsAbout} /></p>
                      )}
                      {!isActiveProject && (
                        <Markdown
                          options={{
                            html: true,
                          }}
                          source={prepMarkdown(
                            getLayerAbout({
                              intl,
                              config,
                              jsonLayerInfo: activeJsonLayerInfo,
                              indicatorId,
                            }),
                            { para: true },
                          )}
                        />
                      )}
                    </Description>
                  </Box>
                )}
              </Tab>
            )}
            {hasTabs && tabClean === settingsTabId && (
              <Tab>
                {config && locale && (
                  <Box flex={false}>
                    <LayerSettings
                      config={config}
                      layerGeometries={layerGeometries}
                      onSetLayerGeometries={onSetLayerGeometries}
                    />
                  </Box>
                )}
              </Tab>
            )}
          </Content>
          {isMinSize(size, MIN_EXPAND) && (
            <Content>
              <TabLabel>
                <FormattedMessage {...messages.keyTabAbout} />
              </TabLabel>
              <Box margin={{ top: 'xsmall'}}>
                {config && locale && (
                  <Description className="mpx-wrap-markdown-description">
                    {isActiveProject && (
                      <p><FormattedMessage {...messages.keyProjectsAbout} /></p>
                    )}
                    {!isActiveProject && (
                      <Markdown
                        options={{
                          html: true,
                        }}
                        source={prepMarkdown(
                          getLayerAbout({
                            intl,
                            config,
                            jsonLayerInfo: activeJsonLayerInfo,
                            indicatorId,
                          }),
                          { para: true },
                        )}
                      />
                    )}
                  </Description>
                )}
              </Box>
            </Content>
          )}
        </ContentWrap>
      )}
    </Styled>
  );
}

PanelKey.propTypes = {
  onLayerInfo: PropTypes.func,
  layersConfig: PropTypes.array,
  activeLayerIds: PropTypes.array,
  jsonLayers: PropTypes.object,
  intl: intlShape.isRequired,
  uiState: PropTypes.object,
  currentModule: PropTypes.object,
  onSetOpen: PropTypes.func,
  chartDate: PropTypes.string,
  layerGeometries: PropTypes.array,
  onSetLayerGeometries: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  chartDate: state => selectChartDate(state),
  layerGeometries: state => selectLayerGeometries(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetOpen: (open, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { open }),
        ),
      ),
    onLayerInfo: id => {
      dispatch(setLayerInfo({ layerId: id }));
      dispatch(showLayerInfoModule(true));
    },
    onSetLayerGeometries: geometries => {
      dispatch(setLayerGeometries(geometries));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PanelKey));
// export default Key;
