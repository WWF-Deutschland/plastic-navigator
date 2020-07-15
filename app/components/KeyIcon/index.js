import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';

import KeyGradient from 'components/KeyGradient';
import KeyCircle from 'components/KeyCircle';

const Styled = styled(p => <Box {...p} fill />)`
  position: relative;
`;

const KeyIconURI = styled.img`
  margin: 0 auto;
  width: ${({ markerSize }) => (markerSize && markerSize.width) || '100%'};
  height: ${({ markerSize }) => (markerSize && markerSize.height) || 'auto'};
`;

const getMarkerSize = configIcon => {
  const sizeXY = configIcon.size.default || configIcon.size;
  // wide
  if (sizeXY.x >= sizeXY.y) {
    return { width: '100%', height: 'auto' };
  }
  // high
  return { height: '100%', width: `${(sizeXY.x / sizeXY.y) * 100}%` };
};

export function KeyIcon({ config, id }) {
  const isIconURI = config.key && config.key.icon && !!config.key.icon.datauri;
  const isIconMarker =
    config.render && config.render.type === 'marker' && !!config.icon.datauri;
  const isGradient =
    config.key && config.key.stops && config.key.type === 'continuous';
  const isCircle =
    config.key &&
    config.render &&
    config.render.type === 'scaledCircle' &&
    !!config.style;
  let marker;
  let markerSize;
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
  return (
    <Styled>
      {isGradient && (
        <KeyGradient
          id={id || config.id}
          stops={config.key.stops}
          log={config.key.scale === 'log'}
        />
      )}
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
