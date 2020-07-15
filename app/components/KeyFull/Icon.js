import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';

const Styled = styled(p => (
  <Box fill {...p} direction="row" align="center" gap="small" />
))`
  position: relative;
`;

const IconWrap = styled(p => <Box {...p} />)`
  height: 40px;
  width: 40px;
  display: block;
  padding: 5px;
`;

const KeyLabel = styled(p => <Text size="small" {...p} />)`
  white-space: nowrap;
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

export function Icon({ config, simple, intl }) {
  const { key, render, icon } = config;
  const { locale } = intl;
  const isIconMarker = render && render.type === 'marker' && !!icon.datauri;
  let uri;
  let markerSize;
  if (isIconMarker) {
    markerSize = getMarkerSize(config.icon);
    const defaultIcon = config.icon.datauri.default;
    if (defaultIcon) {
      if (config.icon.multiple === 'true') {
        uri =
          config.key && config.key.iconValue
            ? defaultIcon[config.key.iconValue]
            : Object.values(defaultIcon)[0];
      } else {
        uri = defaultIcon;
      }
    } else {
      uri = config.icon.datauri;
    }
  } else {
    uri = key && key.icon && key.icon.datauri;
  }

  return (
    <Styled>
      <IconWrap>
        <KeyIconURI src={uri} markerSize={markerSize} />
      </IconWrap>
      <KeyLabel>
        {key &&
          key.title &&
          (!simple || !key['title-short']) &&
          `${key.title[locale] || key.title[DEFAULT_LOCALE]} `}
        {simple &&
          key &&
          key['title-short'] &&
          `${key['title-short'][locale] ||
            key['title-short'][DEFAULT_LOCALE]} `}
      </KeyLabel>
    </Styled>
  );
}

Icon.propTypes = {
  config: PropTypes.object,
  // id: PropTypes.string,
  simple: PropTypes.bool,
  // dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Icon);
