/**
 *
 * Key
 *
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';
import { Menu, CircleInformation } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG } from 'config';

import { startsWith } from 'utils/string';

import KeyGradient from 'components/KeyGradient';
import KeyIcon from 'components/KeyIcon';

// import commonMessages from 'messages';
import messages from './messages';

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
    background="white"
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

const GradientWrap = styled(p => <Box {...p} fill="horizontal" />)`
  display: block;
  height: 20px;
  position: relative;
`;

const DEFAULT_UI_STATE = {
  open: true,
};

export function KeyPanel({
  onLayerInfo,
  layersConfig,
  projects,
  activeLayerIds,
  intl,
}) {
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(DEFAULT_UI_STATE.open);
  const [activeLength, setActiveLength] = useState(0);

  // update active layer when new layers are added
  useEffect(() => {
    if (activeLayerIds.length !== activeLength) {
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

  return (
    <Styled>
      <ToggleWrap>
        <ButtonToggleWrap>
          <ButtonToggle
            icon={open ? <MenuOpen /> : <Menu />}
            onClick={() => setOpen(!open)}
          />
        </ButtonToggleWrap>
        {cleanActiveLayerIds.length > 0 && (
          <KeyUL>
            {cleanActiveLayerIds.map(id => {
              const conf = allConfig && allConfig.find(l => l.id === id);
              return (
                <KeyLI activeLayer={open && id === active}>
                  <ButtonKey
                    onClick={() => {
                      setOpen(!open || id !== active);
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
      </ToggleWrap>
      {open && (
        <ContentWrap>
          <Content>
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
            {tab === 0 && (
              <Tab>
                {config && locale && (
                  <Box>
                    <Title>
                      {isActiveProject ? (
                        <FormattedMessage {...messages.keyProjectsTitle} />
                      ) : (
                        config.title[locale] || config.title[DEFAULT_LOCALE]
                      )}
                    </Title>
                    {!isActiveProject && (
                      <ButtonInfo
                        onClick={() =>
                          onLayerInfo({
                            layer: config['content-id'] || config.id,
                          })
                        }
                        icon={<CircleInformation />}
                      />
                    )}
                    {config.key && config.key.stops && (
                      <GradientWrap>
                        <KeyGradient
                          id={active}
                          stops={config.key.stops}
                          log={config.key.scale === 'log'}
                        />
                      </GradientWrap>
                    )}
                  </Box>
                )}
              </Tab>
            )}
            {tab === 1 && (
              <Tab>
                {config && locale && (
                  <Box>
                    <Title>
                      {isActiveProject ? (
                        <FormattedMessage {...messages.keyProjectsTitle} />
                      ) : (
                        config.title[locale] || config.title[DEFAULT_LOCALE]
                      )}
                    </Title>
                    {!isActiveProject && (
                      <ButtonInfo
                        onClick={() =>
                          onLayerInfo(config['content-id'] || config.id)
                        }
                        icon={<CircleInformation />}
                      />
                    )}
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
        </ContentWrap>
      )}
    </Styled>
  );
}

KeyPanel.propTypes = {
  onLayerInfo: PropTypes.func,
  layersConfig: PropTypes.array,
  activeLayerIds: PropTypes.array,
  projects: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(React.memo(KeyPanel));
// export default Key;
