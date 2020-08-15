/**
 *
 * PanelChapter
 *
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, ResponsiveContext, Text } from 'grommet';
import { Next, Previous, Menu, CircleInformation } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';
import { MODULES } from 'config';

import {
  selectExploreConfig,
  selectLocale,
  selectUIStateByKey,
} from 'containers/App/selectors';
import {
  navigate,
  setUIState,
  setLayerInfo,
  setLayers,
} from 'containers/App/actions';

import KeyFull from 'components/KeyFull';

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
    pad="small"
    background="black"
    elevation="small"
    flex={{ shrink: 0 }}
  />
))`
  width: 40px;
`;
const ButtonToggle = styled(p => <Button {...p} plain />)``;

const MenuOpen = styled(Menu)`
  transform: rotate(90deg);
`;

const ContentWrap = styled(p => (
  <Box {...p} direction="row" gap="hair" fill="horizontal" />
))`
  position: relative;
`;
const Content = styled(p => (
  <Box
    {...p}
    background="black"
    pad="small"
    fill="horizontal"
    elevation="small"
  />
))`
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 300px;
  }
`;

//
// const TitleWrap = styled(Box)``;
const Title = styled(Text)`
  font-size: 22px;
  line-height: 24px;
  margin-top: 0;
  margin-bottom: 5px;
  font-family: 'wwfregular';
  font-weight: normal;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const ButtonWrap = styled(p => <Box {...p} direction="row" gap="small" />)`
  position: absolute;
  bottom: 0;
  right: ${({ theme }) => theme.global.edgeSize.small};
  transform: translateY(50%);
`;
const ButtonNext = styled(p => <Button {...p} reverse plain />)`
  background: ${({ theme }) => theme.global.colors.brand};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 20px;
  padding: 5px 15px;
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDark};
  }
`;
const ButtonPrevious = styled(p => <ButtonNext {...p} />)``;

const Description = styled(Text)``;

const LayersFocusWrap = styled(p => (
  <Box {...p} direction="row" gap="small" />
))``;
const LayerFocus = styled(p => <Box {...p} fill="horizontal" />)``;
const LayerTitleWrap = styled(p => (
  <Box {...p} direction="row" align="center" margin={{ bottom: 'xxsmall' }} />
))``;
const LayerTitle = styled(Text)`
  font-size: 15px;
  font-weight: bold;
`;
const LayerButtonInfo = styled(p => <Button {...p} />)`
  margin-left: ${({ stretch }) => (stretch ? 'auto' : 0)};
`;

// content is split into 2 sub-chapters on small screens
const STEPS = 2;

const COMPONENT_KEY = 'PanelChapter';

const DEFAULT_UI_STATE = {
  open: true,
};

export function PanelChapter({
  onPrevious,
  onNext,
  onSetLayers,
  locale,
  chapter,
  isFirst,
  isLast,
  uiState,
  onSetOpen,
  onLayerInfo,
  layersConfig,
  navModule,
}) {
  const { open } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (chapter) {
      onSetLayers(chapter.layers || []);
    }
  }, [chapter]);

  const configsFocus =
    chapter &&
    chapter.layersFocus &&
    layersConfig &&
    layersConfig.filter(
      l => chapter.layersFocus.slice(0, 2).indexOf(l.id) > -1,
    );
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled>
          <ToggleWrap>
            <ButtonToggle
              icon={open ? <MenuOpen /> : <Menu />}
              onClick={() => onSetOpen(!open)}
            />
          </ToggleWrap>
          {open && (
            <ContentWrap>
              {(size !== 'small' || step === 0) && (
                <Content>
                  {chapter && locale && (
                    <Title>
                      {chapter.title[locale] || chapter.title[DEFAULT_LOCALE]}
                    </Title>
                  )}
                  {configsFocus && configsFocus.length > 0 && (
                    <LayersFocusWrap>
                      {configsFocus.map(config => (
                        <LayerFocus key={config.id}>
                          <LayerTitleWrap
                            fill={configsFocus.length === 1 && 'horizontal'}
                          >
                            {locale && (
                              <LayerTitle>
                                {config['title-short'] &&
                                  (config['title-short'][locale] ||
                                    config['title-short'][DEFAULT_LOCALE])}
                                {!config['title-short'] &&
                                  (config.title[locale] ||
                                    config.title[DEFAULT_LOCALE])}
                              </LayerTitle>
                            )}
                            <LayerButtonInfo
                              onClick={() =>
                                onLayerInfo(config['content-id'] || config.id)
                              }
                              icon={<CircleInformation />}
                              stretch={configsFocus.length === 1}
                            />
                          </LayerTitleWrap>
                          <KeyFull config={config} simple dark />
                        </LayerFocus>
                      ))}
                    </LayersFocusWrap>
                  )}
                </Content>
              )}
              {(size !== 'small' || step === 1) && (
                <Content>
                  {chapter && locale && (
                    <Description>
                      {chapter.description[locale] ||
                        chapter.description[DEFAULT_LOCALE]}
                    </Description>
                  )}
                </Content>
              )}
              <ButtonWrap>
                {(!isFirst || (size === 'small' && step > 0)) && (
                  <ButtonPrevious
                    icon={<Previous color="white" />}
                    onClick={() => {
                      if (size === 'small') {
                        if (step > 0) {
                          setStep(step - 1);
                        }
                        if (step === 0) {
                          if (!isFirst) {
                            setStep(STEPS - 1);
                          }
                          onLayerInfo();
                          onPrevious();
                        }
                      } else {
                        onLayerInfo();
                        onPrevious();
                      }
                    }}
                  />
                )}
                {!isLast && (
                  <ButtonNext
                    icon={<Next color="white" />}
                    label={<FormattedMessage {...messages.next} />}
                    onClick={() => {
                      if (size === 'small') {
                        if (step < STEPS - 1) {
                          setStep(step + 1);
                        }
                        if (step === STEPS - 1) {
                          if (!isLast) {
                            setStep(0);
                          }
                          onLayerInfo();
                          onNext();
                        }
                      } else {
                        onLayerInfo();
                        onNext();
                      }
                    }}
                  />
                )}
                {isLast && (
                  <ButtonNext
                    label={<FormattedMessage {...messages.exploreAll} />}
                    onClick={() => {
                      navModule('explore');
                    }}
                  />
                )}
              </ButtonWrap>
            </ContentWrap>
          )}
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

PanelChapter.propTypes = {
  onSetLayers: PropTypes.func,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  onSetOpen: PropTypes.func,
  onLayerInfo: PropTypes.func,
  layersConfig: PropTypes.array,
  locale: PropTypes.string,
  chapter: PropTypes.object,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  uiState: PropTypes.object,
  navModule: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  exploreConfig: state => selectExploreConfig(state),
  locale: state => selectLocale(state),
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
    onSetLayers: layers => dispatch(setLayers(layers)),
    navModule: id => MODULES[id] && dispatch(navigate(MODULES[id].path)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelChapter);
// export default PanelChapter;
