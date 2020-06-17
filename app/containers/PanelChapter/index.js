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
import { Heading, Box, Button, ResponsiveContext, Text } from 'grommet';
import { Next, Previous, Menu, CircleInformation } from 'grommet-icons';

import {
  selectLayersConfig,
  selectExploreConfig,
  selectLocale,
  selectUIStateByKey,
} from 'containers/App/selectors';
import { setUIState, setLayerInfo, setLayers } from 'containers/App/actions';

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
  <Box {...p} background="black" pad="small" fill="horizontal" />
))`
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 300px;
  }
`;

//
// const TitleWrap = styled(Box)``;
const Title = styled(p => <Heading {...p} level={4} />)`
  margin-top: 0;
`;

const ButtonWrap = styled(p => <Box {...p} direction="row" gap="small" />)`
  position: absolute;
  bottom: 0;
  right: ${({ theme }) => theme.global.edgeSize.small};
  transform: translateY(50%);
`;
const ButtonNext = styled(p => (
  <Button {...p} reverse color="brand" primary />
))``;
const ButtonPrevious = styled(p => <ButtonNext {...p} />)``;

const Description = styled(Text)``;

const LayersFocusWrap = styled(p => <Box {...p} direction="row" />)``;
const LayerFocus = styled(p => <Box {...p} fill="horizontal" />)``;
const LayerTitleWrap = styled(p => (
  <Box {...p} direction="row" align="center" />
))``;
const LayerTitle = styled(Text)``;
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
  layers,
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

  const layersFocus =
    chapter &&
    chapter.layersFocus &&
    layers &&
    layers.filter(l => chapter.layersFocus.slice(0, 2).indexOf(l.id) > -1);
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
                  {chapter && locale && <Title>{chapter.title[locale]}</Title>}
                  {layersFocus && layersFocus.length > 0 && (
                    <LayersFocusWrap>
                      {layersFocus.map(layer => (
                        <LayerFocus key={layer.id}>
                          <LayerTitleWrap
                            fill={layersFocus.length === 1 && 'horizontal'}
                          >
                            {locale && (
                              <LayerTitle>
                                {layer['title-short'] &&
                                  layer['title-short'][locale]}
                                {!layer['title-short'] && layer.title[locale]}
                              </LayerTitle>
                            )}
                            <LayerButtonInfo
                              onClick={() => onLayerInfo(layer.id)}
                              icon={<CircleInformation />}
                              stretch={layersFocus.length === 1}
                            />
                          </LayerTitleWrap>
                          TODO: KEY
                        </LayerFocus>
                      ))}
                    </LayersFocusWrap>
                  )}
                </Content>
              )}
              {(size !== 'small' || step === 1) && (
                <Content>
                  {chapter && locale && (
                    <Description>{chapter.description[locale]}</Description>
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
                          onPrevious();
                        }
                      } else {
                        onPrevious();
                      }
                    }}
                  />
                )}
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
                        onNext();
                      }
                    } else {
                      onNext();
                    }
                  }}
                />
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
  layers: PropTypes.array,
  locale: PropTypes.string,
  chapter: PropTypes.object,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  uiState: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  layersConfig: state => selectLayersConfig(state),
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
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelChapter);
// export default PanelChapter;
