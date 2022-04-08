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

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG } from 'config';

import { startsWith, prepMarkdown } from 'utils/string';
import { isMaxSize, isMinSize } from 'utils/responsive';

import { selectUIStateByKey } from 'containers/App/selectors';
import {
  setUIState,
  setLayerInfo,
  showLayerInfoModule,
} from 'containers/App/actions';

import KeyIcon from 'components/KeyIcon';
import KeyFull from 'components/KeyFull';

// import commonMessages from 'messages';
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
  z-index: 2500;
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
  font-size: 13px;
  line-height: 18px;
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    font-size: 15px;
  }
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
  min-height: 36px;
`;

const LayerTitle = styled(p => <Text size="xsmall" {...p} />)`
  font-weight: 700;
`;

const TabLabel = styled(p => <Text size="xxsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: 700;
`;

const LayerButtonInfo = styled(p => <Button plain {...p} />)`
  padding: ${({ theme }) => theme.global.edgeSize.xxsmall};
  border-radius: 9999px;
  margin-left: auto;
  &:hover {
    background: ${({ theme }) => theme.global.colors.lightHover};
  }
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

  // update key when new layers are added or previous layer has become invalid
  useEffect(() => {
    if (
      // any manual change will lead to a different number of active layers
      activeLayerIds.length !== activeLength ||
      // programamtic changes may lead an invalid active no longer listed
      activeLayerIds.indexOf(active) < 0
    ) {
      const latestActive = activeLayerIds[0];
      const isProject = startsWith(latestActive, `${PROJECT_CONFIG.id}-`);
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
  let activeContent = active || activeLayerIds[0];
  if (startsWith(activeContent, `${PROJECT_CONFIG.id}-`)) {
    activeContent = PROJECT_CONFIG.id;
  }
  const config =
    activeContent && allConfig && allConfig.find(l => l.id === activeContent);
  const isActiveProject = activeContent === PROJECT_CONFIG.id;

  let hasAlreadyProject = false;
  const cleanActiveLayerIds =
    activeLayerIds &&
    activeLayerIds.reduce((memo, id) => {
      const isProject = startsWith(id, `${PROJECT_CONFIG.id}-`);
      const cleanId = isProject ? PROJECT_CONFIG.id : id;
      const pass = !isProject || !hasAlreadyProject;
      hasAlreadyProject = hasAlreadyProject || isProject;
      return pass ? [...memo, cleanId] : memo;
    }, []);

  const jsonLayerActive = config ? jsonLayers[config.id] : null;
  const isModuleLayer =
    config &&
    currentModule &&
    currentModule.featuredLayer &&
    (currentModule.featuredLayer === config['content-default'] ||
      currentModule.featuredLayer === config.id);
  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
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
                    const conf = allConfig && allConfig.find(l => l.id === id);
                    return (
                      <KeyLI key={id}>
                        <ButtonKey
                          activeLayer={open && id === activeContent}
                          onClick={() => {
                            onSetOpen(true);
                            setActive(id);
                          }}
                          disabled={open && id === activeContent}
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
                  top: isMaxSize(size, MAX_FOLD) ? 'xsmall' : 'small',
                  bottom: 'small',
                  horizontal: 'small',
                }}
                style={{ zIndex: 2 }}
              >
                {isMaxSize(size, MAX_FOLD) && (
                  <Box direction="row" gap="xsmall" flex={false}>
                    <ButtonTab
                      onClick={() => setTab(0)}
                      label={
                        <TabLabel>
                          <FormattedMessage {...messages.keyTabKey} />
                        </TabLabel>
                      }
                      activeTab={tab === 0}
                    />
                    <ButtonTab
                      onClick={() => setTab(1)}
                      label={
                        <TabLabel>
                          <FormattedMessage {...messages.keyTabAbout} />
                        </TabLabel>
                      }
                      activeTab={tab === 1}
                    />
                  </Box>
                )}
                {(tab === 0 || isMinSize(size, MIN_EXPAND)) && (
                  <Tab>
                    {config && locale && (
                      <Box flex={false}>
                        {isMinSize(size, MIN_EXPAND) && (
                          <TabLabel>
                            <FormattedMessage {...messages.keyTabKey} />
                          </TabLabel>
                        )}
                        <LayerTitleWrap>
                          <LayerTitle>
                            {isActiveProject ? (
                              <FormattedMessage {...messages.keyProjectsTitle} />
                            ) : (
                              config.title[locale] || config.title[DEFAULT_LOCALE]
                            )}
                          </LayerTitle>
                          {!isActiveProject && !isModuleLayer && (
                            <LayerButtonInfo
                              onClick={() => {
                                onLayerInfo(config['content-default'] || config.id);
                              }}
                              icon={<Info />}
                            />
                          )}
                        </LayerTitleWrap>
                        <KeyFull
                          config={config}
                          layerData={jsonLayerActive && jsonLayerActive.data}
                          excludeEmpty
                        />
                      </Box>
                    )}
                  </Tab>
                )}
                {tab === 1 && isMaxSize(size, MAX_FOLD) && (
                  <Tab>
                    {config && locale && (
                      <Box flex={false}>
                        <LayerTitleWrap>
                          <LayerTitle>
                            {isActiveProject ? (
                              <FormattedMessage {...messages.keyProjectsTitle} />
                            ) : (
                              config.title[locale] || config.title[DEFAULT_LOCALE]
                            )}
                          </LayerTitle>
                          {!isActiveProject && !isModuleLayer && (
                            <LayerButtonInfo
                              onClick={() => {
                                onLayerInfo(config.id);
                              }}
                              icon={<Info />}
                            />
                          )}
                        </LayerTitleWrap>
                        <Description className="mpx-wrap-markdown-description">
                          {isActiveProject && (
                            <FormattedMessage {...messages.keyProjectsAbout} />
                          )}
                          {!isActiveProject && (
                            <Markdown
                              options={{
                                html: true,
                              }}
                              source={prepMarkdown(
                                config.about[locale] ||
                                  config.about[DEFAULT_LOCALE],
                                { para: true },
                              )}
                            />
                          )}
                        </Description>
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
                  <Box margin={{ top: 'small'}}>
                    {config && locale && (
                      <Text>
                        {isActiveProject ? (
                          <FormattedMessage {...messages.keyProjectsAbout} />
                        ) : (
                          config.about[locale] || config.about[DEFAULT_LOCALE]
                        )}
                      </Text>
                    )}
                  </Box>
                </Content>
              )}
            </ContentWrap>
          )}
        </Styled>
      )}
    </ResponsiveContext.Consumer>
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
};

const mapStateToProps = createStructuredSelector({
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
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
      dispatch(setLayerInfo(id));
      dispatch(showLayerInfoModule(true));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PanelKey));
// export default Key;
