import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';

import KeyGradient from 'components/KeyGradient';
import KeyCircle from 'components/KeyCircle';
import KeyArea from 'components/KeyArea';

const Styled = styled(p => <Box {...p} fill align="center" justify="center" />)`
  position: relative;
  background: ${({ theme, background }) =>
    background ? theme.global.colors[background] || background : 'transparent'};
`;

const KeyIconURI = styled.img`
  margin: 0 auto;
  width: ${({ markerSize }) => (markerSize && markerSize.width) || '100%'};
  height: ${({ markerSize }) => (markerSize && markerSize.height) || 'auto'};
  max-width: ${({ markerSize }) =>
    (markerSize && markerSize.maxWidth) || 'auto'};
`;

const getMarkerSize = configIcon => {
  const sizeXY =
    (configIcon.size && configIcon.size.default) || configIcon.size;
  // wide
  if (!sizeXY) {
    return { width: '100%', height: 'auto' };
  }
  if (sizeXY.x >= sizeXY.y) {
    return { width: '100%', height: 'auto', maxWidth: `${sizeXY.x}px` };
  }
  // high
  return { height: '100%', width: `${(sizeXY.x / sizeXY.y) * 100}%` };
};

export function KeyIcon({ config, id }) {
  const isIconURI = config.key && config.key.icon && !!config.key.icon.datauri;
  const isIconMarker =
    config.render && config.render.type === 'marker' && !isIconURI;
  const isGradient =
    config.key && config.key.stops && config.key.type === 'continuous';
  const isCircle =
    config.key &&
    config.render &&
    config.render.type === 'scaledCircle' &&
    !!config.style;
  const isArea =
    config.key &&
    config.render &&
    config.render.type === 'area' &&
    !!config.featureStyle;
  let marker;
  let markerSize;
  if (isIconURI) {
    markerSize = getMarkerSize(config.key.icon);
  }
  if (isIconMarker) {
    markerSize = getMarkerSize(config.icon);
    const defaultIcon = config.icon.datauri.default;
    if (defaultIcon) {
      if (config.icon.multiple === 'true') {
        let value;
        if (config.key && config.key.iconValue && config.key.iconValue.simple) {
          value = config.key.iconValue.simple;
        } else if (config.key && config.key.iconValue) {
          value = config.key.iconValue;
        }
        marker = value ? defaultIcon[value] : Object.values(defaultIcon)[0];
      } else {
        marker = defaultIcon;
      }
    } else {
      marker = config.icon.datauri;
    }
  }
  let areaStyles = [];
  if (
    isArea &&
    config.featureStyle &&
    config.featureStyle.style &&
    config.featureStyle.multiple === 'true' &&
    config.key &&
    config.key.values
  ) {
    areaStyles = config.key.values.map(val =>
      Object.keys(config.featureStyle.style).reduce(
        (memo, attr) => ({
          ...memo,
          [attr]: config.featureStyle.style[attr][val],
        }),
        {
          fillOpacity: 0.4,
        },
      ),
    );
  }
  return (
    <Styled background={isIconURI && config.key.icon.background}>
      {isGradient && (
        <KeyGradient
          id={id || config.id}
          stops={config.key.stops}
          log={config.key.scale === 'log'}
        />
      )}
      {isArea && <KeyArea areaStyles={areaStyles} />}
      {isCircle && <KeyCircle circleStyle={config.style} />}
      {isIconURI && (
        <KeyIconURI src={config.key.icon.datauri} markerSize={markerSize} />
      )}
      {isIconMarker && <KeyIconURI src={marker} markerSize={markerSize} />}
    </Styled>
  );
}

KeyIcon.propTypes = {
  config: PropTypes.object,
  id: PropTypes.string,
};

export default KeyIcon;
