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
import { Menu, CircleInformation, FormDown, FormUp } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG } from 'config';

import { startsWith } from 'utils/string';
import { isMaxSize, isMinSize } from 'utils/responsive';

import { selectUIStateByKey } from 'containers/App/selectors';
import { setUIState, setLayerInfo } from 'containers/App/actions';

import KeyIcon from 'components/KeyIcon';
import KeyFull from 'components/KeyFull';

import { getRange } from 'containers/Map/utils';

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
    ? '0px 4px 8px rgba(0, 0, 0, 0.1)'
    : '0px -4px 12px rgba(0, 0, 0, 0.1)'};
  &:hover {
    background: ${({ theme }) => theme.global.colors.white};
    box-shadow: ${({ top }) => top
    ? '0px 4px 8px rgba(0, 0, 0, 0.2)'
    : '0px -4px 12px rgba(0, 0, 0, 0.2)'};
  }
`;

const Styled = styled(p => <Box {...p} direction="row" gap="hair" />)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30px;
  width: 100%;
  height: 200px;
  pointer-events: all;
  z-index: 4000;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    right: auto;
    width: auto;
    bottom: 40px;
  }
`;

const ToggleWrap = styled(p => (
  <Box
    {...p}
    fill="vertical"
    align="center"
    background="white"
    elevation="medium"
    flex={{ shrink: 0 }}
  />
))`
  width: 40px;
  overflow: hidden;
`;
const ButtonToggleWrap = styled.div`
  height: 40px;
  width: 40px;
`;
const ButtonToggle = styled(p => <Button {...p} plain fill="horizontal" />)`
  height: 40px;
  width: 40px;
  text-align: center;
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
  background: ${({ activeLayer, theme }) =>
    theme.global.colors[activeLayer ? 'light-4' : 'white']};
  height: 40px;
  width: 40px;
  display: block;
  padding: 5px;
`;
const ButtonKey = styled(p => <Button {...p} plain fill />)``;

const ButtonInfo = styled(p => <Button {...p} plain fill />)``;

const MenuOpen = styled(Menu)`
  transform: rotate(90deg);
`;

const Tab = styled(Box)``;

const ContentWrap = styled(p => (
  <Box {...p} direction="row" gap="hair" fill="horizontal" />
))`
  position: relative;
`;
const Content = styled(p => (
  <Box
    {...p}
    background="white-trans"
    pad="small"
    fill="horizontal"
    elevation="medium"
  />
))`
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 300px;
  }
`;

//
// const TitleWrap = styled(Box)``;
const Title = styled(Text)`
  margin: 0;
  font-weight: bold;
`;

const COMPONENT_KEY = 'PanelKey';

const DEFAULT_UI_STATE = {
  open: true,
};

const OFFSET_STEP = 80;

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

export function PanelKey({
  onLayerInfo,
  layersConfig,
  projects,
  activeLayerIds,
  intl,
  jsonLayers,
  uiState,
  onSetOpen,
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

  // update active layer when new layers are added
  useEffect(() => {
    if (!active || activeLayerIds.length !== activeLength) {
      const latestActive = activeLayerIds[0];
      const isProject =
        projects &&
        projects.find(
          p =>
            p.project_id === latestActive.replace(`${PROJECT_CONFIG.id}-`, ''),
        );
      if (isProject) {
        setActive(PROJECT_CONFIG.id);
      } else {
        setActive(latestActive);
      }
      setKeyIconOffset(0);
    }
    setActiveLength(activeLayerIds.length);
  }, [activeLayerIds, activeLength]);

  const { locale } = intl;
  const allConfig = layersConfig && [...layersConfig, PROJECT_CONFIG];
  const config = active && allConfig && allConfig.find(l => l.id === active);
  const isActiveProject = active === PROJECT_CONFIG.id;

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

  const jsonLayerActive =
    config &&
    config.type === 'geojson' &&
    config.source === 'data' &&
    jsonLayers[config.id];

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled>
          <ToggleWrap>
            <ButtonToggleWrap>
              <ButtonToggle
                icon={open ? <MenuOpen /> : <Menu />}
                onClick={() => onSetOpen(!open)}
              />
            </ButtonToggleWrap>
            <Box ref={keyWrapperRef} fill style={{ position: 'relative', overflow: 'hidden' }}>
              {keyULRef.current &&
                keyWrapperRef.current &&
                hasScrollTop(keyIconOffset) && (
                <KeyScrollButton
                  icon={<FormUp size="large" />}
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
                      <KeyLI activeLayer={open && id === active} key={id}>
                        <ButtonKey
                          onClick={() => {
                            onSetOpen(!open || id !== active);
                            setActive(id);
                          }}
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
                  icon={<FormDown size="large" />}
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
              <Content>
                {isMaxSize(size, 'large') && (
                  <Box direction="row" gap="xsmall" margin={{ bottom: 'small' }}>
                    <ButtonTab
                      onClick={() => setTab(0)}
                      label={<FormattedMessage {...messages.keyTabKey} />}
                      activeTab={tab === 0}
                    />
                    <ButtonTab
                      onClick={() => setTab(1)}
                      label={<FormattedMessage {...messages.keyTabAbout} />}
                      activeTab={tab === 1}
                    />
                  </Box>
                )}
                {(tab === 0 || isMinSize(size, 'xlarge')) && (
                  <Tab>
                    {config && locale && (
                      <Box>
                        {isMinSize(size, 'xlarge') && (
                          <Box>
                            <FormattedMessage {...messages.keyTabKey} />
                          </Box>
                        )}
                        <Box
                          direction="row"
                          fill="horizontal"
                          justify="between"
                          align="center"
                          gap="small"
                        >
                          <Box>
                            <Title>
                              {isActiveProject ? (
                                <FormattedMessage {...messages.keyProjectsTitle} />
                              ) : (
                                config.title[locale] || config.title[DEFAULT_LOCALE]
                              )}
                            </Title>
                          </Box>
                          {!isActiveProject && (
                            <Box>
                              <ButtonInfo
                                onClick={() =>
                                  onLayerInfo({ layer: config.id })
                                }
                                icon={<CircleInformation />}
                              />
                            </Box>
                          )}
                        </Box>
                        <KeyFull
                          config={config}
                          range={
                            (jsonLayerActive && jsonLayerActive.data)
                              ? getRange(
                                jsonLayerActive.data.features,
                                config.render.attribute,
                              )
                              : null
                          }
                        />
                      </Box>
                    )}
                  </Tab>
                )}
                {tab === 1 && isMaxSize(size, 'large') && (
                  <Tab>
                    {config && locale && (
                      <Box>
                        <Box
                          direction="row"
                          fill="horizontal"
                          justify="between"
                          align="center"
                          gap="small"
                        >
                          <Box>
                            <Title>
                              {isActiveProject ? (
                                <FormattedMessage {...messages.keyProjectsTitle} />
                              ) : (
                                config.title[locale] || config.title[DEFAULT_LOCALE]
                              )}
                            </Title>
                          </Box>
                          {!isActiveProject && (
                            <Box>
                              <ButtonInfo
                                onClick={() =>
                                  onLayerInfo({
                                    layer: config['content-id'] || config.id,
                                  })
                                }
                                icon={<CircleInformation />}
                              />
                            </Box>
                          )}
                        </Box>
                        <Text>
                          {isActiveProject ? (
                            <FormattedMessage {...messages.keyProjectsAbout} />
                          ) : (
                            config.about[locale] || config.about[DEFAULT_LOCALE]
                          )}
                        </Text>
                      </Box>
                    )}
                  </Tab>
                )}
              </Content>
              {isMinSize(size, 'xlarge') && (
                <Content>
                  <Box>
                    <FormattedMessage {...messages.keyTabAbout} />
                  </Box>
                  {config && locale && (
                    <Text>
                      {isActiveProject ? (
                        <FormattedMessage {...messages.keyProjectsAbout} />
                      ) : (
                        config.about[locale] || config.about[DEFAULT_LOCALE]
                      )}
                    </Text>
                  )}
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
  projects: PropTypes.array,
  jsonLayers: PropTypes.object,
  intl: intlShape.isRequired,
  uiState: PropTypes.object,
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
    onLayerInfo: id => dispatch(setLayerInfo(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PanelKey));
// export default Key;
