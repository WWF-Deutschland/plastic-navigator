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
import Markdown from 'react-remarkable';

import {
  Expand,
  Collapse,
  ArrowRight,
  ArrowLeft,
  InfoOutline,
} from 'components/Icons';

import { prepMarkdown } from 'utils/string';

import { DEFAULT_LOCALE } from 'i18n';
import { MODULES } from 'config';

import {
  selectExploreConfig,
  selectLocale,
  selectUIStateByKey,
} from 'containers/App/selectors';
import { selectLayers } from 'containers/Map/selectors';
import {
  navigate,
  setUIState,
  setLayerInfo,
  setLayers,
} from 'containers/App/actions';

import KeyFull from 'components/KeyFull';

import { isMinSize, isMaxSize } from 'utils/responsive';

// import commonMessages from 'messages';
import messages from './messages';

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
    elevation="small"
    flex={{ shrink: 0 }}
    responsive={false}
    background="black"
  />
))`
  width: 40px;
  position: relative;
  z-index: 3;
`;
const ButtonToggle = styled(p => <Button {...p} plain fill />)`
  background: ${({ theme }) => theme.global.colors.black};
  padding: ${({ theme }) => theme.global.edgeSize.small};
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
`;

const ContentWrap = styled(p => (
  <Box {...p} direction="row" gap="hair" fill="horizontal" />
))`
  position: relative;
  z-index: 2;
`;
const Content = styled(p => (
  <Box
    {...p}
    background="black"
    pad={{ horizontal: 'small', top: 'small' }}
    fill="horizontal"
    elevation="small"
    responsive={false}
    flex={false}
  />
))`
  max-width: 350px;
  overflow: hidden;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 300px;
  }
`;

//
// const TitleWrap = styled(Box)``;
const Title = styled(Text)`
  font-size: 22px;
  line-height: 23px;
  margin: 0;
  margin-bottom: 5px;
  font-family: 'wwfregular';
  font-weight: normal;
  text-transform: uppercase;
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    font-size: 26px;
    line-height: 27px;
  }
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
  padding: 2px 12px;
  height: 25px;
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDark};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    font-size: 20px;
    height: 35px;
    padding: 5px 20px;
  }
`;
const ButtonPrevious = styled(p => <ButtonNext {...p} />)`
  padding: 2px 12px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 5px 15px;
  }
`;
const LabelWrap = styled(p => <Box {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-size: 16px;
  line-height: 1;
`;

const Description = styled(Text)`
  font-size: 13px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    font-size: 15px;
  }
`;

const LayersFocusWrap = styled(p => (
  <Box {...p} direction="row" gap="xsmall" flex={false} fill />
))``;

const LayerFocus = styled(p => <Box {...p} />)``;

const LayerTitleWrap = styled(p => (
  <Box direction="row" align="center" margin={{ bottom: 'xsmall' }} {...p} />
))``;

const LayerTitle = styled(Text)`
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
`;

const LayerButtonInfo = styled(p => <Button plain {...p} />)`
  padding: ${({ theme }) => theme.global.edgeSize.xxsmall};
  border-radius: 9999px;
  margin-left: ${({ stretch }) => (stretch ? 'auto' : 0)};
  &:hover {
    background: ${({ theme }) => theme.global.colors['dark-1']};
  }
`;

// content is split into 2 sub-chapters on small screens
const STEPS = 2;

const COMPONENT_KEY = 'PanelChapter';

const DEFAULT_UI_STATE = {
  open: true,
};

const MIN_EXPAND = 'xlarge';
const MAX_FOLD = 'large';

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
  jsonLayers,
}) {
  const { open } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (chapter && layersConfig) {
      onSetLayers(chapter.layers || []);
    }
  }, [chapter, layersConfig]);

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
              icon={
                <Box fill justify="start">
                  {open ? <Collapse /> : <Expand />}
                </Box>
              }
              onClick={() => onSetOpen(!open)}
            />
          </ToggleWrap>
          {open && (
            <ContentWrap>
              {(isMinSize(size, MIN_EXPAND) || step === 0) && (
                <Content>
                  {chapter && locale && (
                    <Title>
                      {chapter.title[locale] || chapter.title[DEFAULT_LOCALE]}
                    </Title>
                  )}
                  {configsFocus && configsFocus.length > 0 && (
                    <LayersFocusWrap
                      basis={configsFocus.length > 1 ? '1/2' : 'auto'}
                    >
                      {configsFocus.map(config => (
                        <LayerFocus key={config.id} fill="horizontal">
                          <LayerTitleWrap fill="horizontal">
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
                                onLayerInfo(
                                  config['content-default'] || config.id,
                                )
                              }
                              icon={<InfoOutline />}
                              stretch
                            />
                          </LayerTitleWrap>
                          <KeyFull
                            config={config}
                            simple
                            dark
                            layerData={
                              config && jsonLayers[config.id]
                                ? jsonLayers[config.id].data
                                : null
                            }
                          />
                        </LayerFocus>
                      ))}
                    </LayersFocusWrap>
                  )}
                </Content>
              )}
              {(isMinSize(size, MIN_EXPAND) || step === 1) && (
                <Content>
                  {chapter && locale && (
                    <Description className="mpx-wrap-markdown-description">
                      <Markdown
                        options={{
                          html: true,
                        }}
                        source={prepMarkdown(
                          chapter.description[locale] ||
                            chapter.description[DEFAULT_LOCALE],
                          { para: true },
                        )}
                      />
                    </Description>
                  )}
                </Content>
              )}
              <ButtonWrap>
                {(!isFirst || (isMaxSize(size, MAX_FOLD) && step > 0)) && (
                  <ButtonPrevious
                    icon={<ArrowLeft color="white" />}
                    onClick={() => {
                      if (isMaxSize(size, MAX_FOLD)) {
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
                {(!isLast || (isMaxSize(size, MAX_FOLD) && step === 0)) && (
                  <ButtonNext
                    icon={<ArrowRight color="white" />}
                    label={
                      <LabelWrap
                        margin={{ top: size === 'small' ? '-3px' : '-4px' }}
                      >
                        <FormattedMessage {...messages.next} />
                      </LabelWrap>
                    }
                    gap={size === 'small' ? 'xsmall' : 'small'}
                    onClick={() => {
                      if (isMaxSize(size, MAX_FOLD)) {
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
                {isLast && (!isMaxSize(size, MAX_FOLD) || step > 0) && (
                  <ButtonNext
                    label={
                      <LabelWrap margin={{ top: '-4px' }}>
                        <FormattedMessage {...messages.exploreAll} />
                      </LabelWrap>
                    }
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
  jsonLayers: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  exploreConfig: state => selectExploreConfig(state),
  locale: state => selectLocale(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  jsonLayers: state => selectLayers(state),
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
