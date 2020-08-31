import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
import { Button, Box } from 'grommet';
import { CloseS } from 'components/Icons';

import { roundNumber } from 'utils/numbers';

import { PROJECT_CONFIG } from 'config';

import TooltipContent from './TooltipContent';
import TooltipProjectContent from './TooltipProjectContent';
import messages from './messages';

import { getPropertyByLocale } from './utils';

const Root = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2501;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    bottom: auto;
    right: auto;
    top: ${({ position }) => position.y}px;
    left: ${({ position }) => position.x}px;
  }
`;

// const BlockMouse = styled.div`
//   position: absolute;
//   top: -40px;
//   left: ${({ dirLeft }) => (dirLeft ? '-60px' : '0px')};
//   width: 60px;
//   background: transparent];
//   height: 60px;
//   display: block;
// `;

// prettier-ignore
const Anchor = styled.div`
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    position: absolute;
    top: ${({ xy }) => xy.y}px;
    left: ${({ dirLeft, xy, w }) =>
    dirLeft ? -1 * (xy.x + w) : xy.x}px;
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
  }
`;

// eslint-ebable prefer-template
// border-right-color: ${({ dirLeft }) => (!dirLeft ? 'white' : 'transparent')};

const Main = styled.div`
  height: 235px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
  display: block;
  background: white;
  width: 100%;
  overflow: auto;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    min-height: 200px;
    max-height: 350px;
    height: auto;
    overflow: visible;
    position: absolute;
    top: -40px;
    left: ${({ dirLeft }) => (dirLeft ? -10 : 10)}px;
    width: ${({ w }) => w}px;
    pointer-events: all;
  }
`;

const Title = styled.div`
  font-family: 'wwfregular';
  font-weight: normal;
  letter-spacing: 0.1px;
  font-size: 30px;
  line-height: 1;
  margin-bottom: 20px;
`;
const SupTitle = styled.div`
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8em;
`;

const CloseWrap = styled.div`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 12px;
  top: 10px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    right: -10px;
    top: -10px;
  }
`;

const CloseButton = styled(Button)`
  border-radius: 9999px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.2);
  background: black;
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
`;

const ButtonWrap = styled.div`
  position: absolute;
  bottom: 10px;
  right: 12px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    right: ${({ theme }) => theme.global.edgeSize.small};
    bottom: 0;
    transform: translateY(50%);
  }
`;
const ButtonMore = styled(p => <Button {...p} plain />)`
  background: ${({ theme }) => theme.global.colors.brand};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 20px;
  padding: 8px 20px;
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-size: 16px;
  line-height: 1;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDark};
  }
`;

const getTitle = (feature, config, layer, intl) => {
  const { locale } = intl;
  if (config.tooltip.title.property) {
    const value = feature.properties[config.tooltip.title.property];
    if (config.tooltip.title.type === 'number') {
      const rounded = roundNumber(value, 0);
      const unit =
        config.tooltip.title.units &&
        config.tooltip.title.units === 'true' &&
        config.data.unit[locale];
      return `${intl.formatNumber(rounded)} ${unit}`;
    }
    return value;
  }
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

const getMarkerSize = config => {
  if (config.render && config.render.type === 'scaledCircle') {
    return { x: 0, y: 0 };
  }
  if (config.render && config.render.type === 'area') {
    return { x: 0, y: 0 };
  }
  if (config.icon && config.icon.size) {
    return config.icon.size.default || config.icon.size;
  }
  return { x: 25, y: 50 };
};
const getOffset = (config, feature, markerSize) => ({
  x: parseInt(markerSize.x, 10) / 2,
  y:
    config.icon && config.icon.align && config.icon.align === 'center'
      ? 0
      : (-1 * parseInt(markerSize.y, 10)) / 2,
});

const WIDTH = 250;

const Tooltip = ({
  position,
  direction,
  config,
  feature,
  intl,
  layerOptions,
  onClose,
  onFeatureClick,
}) => {
  const { tooltip } = config;
  const { locale } = intl;
  const markerSize = getMarkerSize(config, feature, layerOptions);
  const offset = getOffset(config, feature, markerSize);
  const layer = layerOptions ? layerOptions.layer : null;
  // prettier-ignore
  return (
    <Root position={position}>
      <Anchor dirLeft={direction.x === 'left'} xy={offset} w={WIDTH}>
        <Main
          dirLeft={direction.x === 'left'}
          w={WIDTH}
        >
          <Box margin="small" responsive={false}>
            {tooltip.supTitle && (
              <SupTitle>{getSupTitle(feature, config, layer, locale)}</SupTitle>
            )}
            {tooltip.title && (
              <Title>{getTitle(feature, config, layer, intl)}</Title>
            )}
            {tooltip.content && (
              <TooltipContent feature={feature} config={config} layer={layer} />
            )}
            {config.id === PROJECT_CONFIG.id && (
              <TooltipProjectContent loaction={feature.properties} project={layer} />
            )}
            {tooltip.more !== 'false' && (
              <ButtonWrap>
                <ButtonMore
                  label={
                    <Box margin={{ top: '-2px' }}>
                      {intl.formatMessage(messages.tooltipMore)}
                    </Box>
                  }
                  onClick={() => {
                    onFeatureClick({
                      feature: feature.properties.f_id,
                      copy: layerOptions ? layerOptions.copy : null,
                      layer: layer && config.data['layer-id']
                        ? `${config.id}-${layer[config.data['layer-id']]}`
                        : config.id,
                    });
                  }}
                />
              </ButtonWrap>
            )}
          </Box>
          <CloseWrap>
            <CloseButton
              plain
              onClick={() => onClose()}
              icon={<CloseS color="white" />}
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
  onFeatureClick: PropTypes.func,
};

export default injectIntl(Tooltip);
