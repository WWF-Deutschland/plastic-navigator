import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
import { Box, Button } from 'grommet';
import { Close } from 'grommet-icons';
import TooltipContent from './TooltipContent';

import { getPropertyByLocale } from './utils';

const Root = styled.div`
  position: relative;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  z-index: 3000;
`;

// prettier-ignore
const Anchor = styled.div`
  position: absolute;
  top: ${({ offset }) => offset.y}px;
  left: ${({ dirLeft, offset, w }) =>
    dirLeft ? -1 * (offset.x + w) : offset.x}px;
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    display: inline-block;
    border-width: ${({ dirLeft }) =>
    dirLeft ? '7px 0 7px 10px' : '7px 10px 7px 0'};
    border-color: ${({ dirLeft }) =>
    dirLeft ? 'transparent transparent transparent white' : 'transparent white transparent transparent'};
    position: relative;
    top: -7px;
    left: ${({ dirLeft, w }) => (dirLeft ? w - 10 : 'auto')}${({ dirLeft }) => (dirLeft ? 'px' : '')};
  }
`;
// eslint-ebable prefer-template
// border-right-color: ${({ dirLeft }) => (!dirLeft ? 'white' : 'transparent')};

const Main = styled.div`
  position: absolute;
  top: -40px;
  left: ${({ dirLeft }) => (dirLeft ? -10 : 10)}px;
  display: block;
  background: white;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
  width: ${({ w }) => w}px;
  min-height: 100px;
  pointer-events: all;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.3em;
`;
const SupTitle = styled.div``;

const CloseWrap = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: white;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
`;

const getTitle = (feature, config, layer, locale) => {
  if (config.tooltip.title.propertyByLocale) {
    return getPropertyByLocale(
      feature.properties,
      config.tooltip.title,
      locale,
    );
  }
  if (layer && config.tooltip.title.propertyFromLayer) {
    return getPropertyByLocale(
      layer,
      config.tooltip.title.propertyFromLayer,
      locale,
    );
  }
  return config.tooltip.title[locale];
};
const getSupTitle = (feature, config, layer, locale) => {
  if (config.tooltip.supTitle.propertyByLocale) {
    return getPropertyByLocale(
      feature.properties,
      config.tooltip.supTitle,
      locale,
    );
  }
  if (layer && config.tooltip.supTitle.propertyFromLayer) {
    return getPropertyByLocale(
      layer,
      config.tooltip.supTitle.propertyFromLayer,
      locale,
    );
  }
  return config.tooltip.supTitle[locale];
};

const WIDTH = 250;

const Tooltip = ({
  position,
  direction,
  config,
  feature,
  intl,
  layerOptions,
  onClose,
  onLayerInfo,
}) => {
  const { icon, tooltip } = config;
  const { locale } = intl;
  const markerSize = (icon && icon.size) || { x: 25, y: 50 };
  const offset = {
    x: parseInt(markerSize.x, 10) / 2,
    y:
      icon.align && icon.align === 'center'
        ? 0
        : (-1 * parseInt(markerSize.y, 10)) / 2,
  };
  const layer = layerOptions ? layerOptions.layer : null;
  // prettier-ignore
  return (
    <Root position={position}>
      <Anchor dirLeft={direction.x === 'left'} offset={offset} w={WIDTH}>
        <Main
          dirLeft={direction.x === 'left'}
          w={WIDTH}
        >
          <Box margin="small">
            {tooltip.supTitle && (
              <SupTitle>{getSupTitle(feature, config, layer, locale)}</SupTitle>
            )}
            {tooltip.title && (
              <Title>{getTitle(feature, config, layer, locale)}</Title>
            )}
            {tooltip.content && (
              <TooltipContent feature={feature} config={config} layer={layer} />
            )}
            {tooltip.info && layer && (
              <Button
                label="About"
                onClick={() => {
                  // console.log(layer, feature)
                  onLayerInfo(layer.id);
                }}
              />
            )}
          </Box>
          <CloseWrap>
            <Button
              plain
              onClick={() => onClose()}
              icon={<Close size="large" />}
              fill
              style={{
                textAlign: 'center',
              }}
            />
          </CloseWrap>
        </Main>
      </Anchor>
    </Root>
  );
};

Tooltip.propTypes = {
  position: PropTypes.object,
  direction: PropTypes.object, // x, y
  config: PropTypes.object,
  feature: PropTypes.object,
  layerOptions: PropTypes.object,
  intl: intlShape.isRequired,
  onClose: PropTypes.func,
  onLayerInfo: PropTypes.func,
};

export default injectIntl(Tooltip);
