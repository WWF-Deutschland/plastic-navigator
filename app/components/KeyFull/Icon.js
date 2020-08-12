import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';

import asArray from 'utils/as-array';

import messages from './messages';

const Hint = styled(p => <Text size="small" {...p} />)`
  font-style: italic;
`;

const IconLabelWrap = styled(p => (
  <Box fill="horizontal" direction="row" align="center" gap="xxsmall" {...p} />
))`
  position: relative;
`;

const IconWrap = styled(p => <Box flex={{ shrink: 0 }} {...p} />)`
  height: 40px;
  width: 40px;
  display: block;
  padding: 5px;
  background: ${({ addBackground }) =>
    addBackground ? 'white' : 'transparent'};
`;
const LabelWrap = styled(p => <Box {...p} />)``;

const KeyLabel = styled(p => <Text size="small" {...p} />)``;

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

export function Icon({ config, simple, intl, dark, title }) {
  const { key, render, icon } = config;
  const { locale } = intl;
  const isIconMarker = render && render.type === 'marker' && !!icon.datauri;
  let marker = { uri: null, title, id: config.id };
  let markerSize;
  if (!isIconMarker) {
    marker.uri = key && key.icon && key.icon.datauri;
  } else {
    markerSize = getMarkerSize(icon);
    const defaultIcon = icon.datauri.default;
    if (defaultIcon) {
      if (icon.multiple === 'true') {
        const hasFull = key && key.iconValue && !!key.iconValue.full;
        // simple : pick one
        if (simple || !hasFull) {
          let value;
          if (key && key.iconValue && key.iconValue.simple) {
            value = key.iconValue.simple;
          } else if (key && key.iconValue) {
            value = key.iconValue;
          }
          marker.uri = value
            ? defaultIcon[value]
            : Object.values(defaultIcon)[0];
          if (key.iconTitle) {
            if (key.iconTitle.simple) {
              marker.title =
                key.iconTitle.simple[locale] ||
                config.key.iconTitle.simple[DEFAULT_LOCALE] ||
                config.key.iconTitle.simple;
            } else {
              marker.title =
                key.iconTitle[locale] ||
                config.key.iconTitle[DEFAULT_LOCALE] ||
                config.key.iconTitle;
            }
          }
        }
        // not simple: show all
        else if (hasFull) {
          marker = key.iconValue.full.map(val => {
            let t;
            if (key.iconTitle) {
              if (key.iconTitle.full) {
                t =
                  key.iconTitle.full[val][locale] ||
                  key.iconTitle.full[val][DEFAULT_LOCALE] ||
                  key.iconTitle.full[val];
              } else {
                t =
                  key.iconTitle[locale] ||
                  key.iconTitle[DEFAULT_LOCALE] ||
                  key.iconTitle;
              }
            }
            return {
              id: val,
              uri: defaultIcon[val],
              title: t,
            };
          });
        }
      } else {
        marker.uri = defaultIcon;
      }
    } else {
      marker.uri = config.icon.datauri;
    }
  }
  if (!marker.title) {
    if (key && key.title && (!simple || !key['title-short'])) {
      marker.title = `${key.title[locale] || key.title[DEFAULT_LOCALE]} `;
    }
    if (simple && key && key['title-short']) {
      marker.title = `${key['title-short'][locale] ||
        key['title-short'][DEFAULT_LOCALE]} `;
    }
  }
  const addBackground =
    dark &&
    key.icon &&
    key.icon.needsBackgroundOnDark &&
    key.icon.needsBackgroundOnDark === 'true';

  return (
    <Box>
      {asArray(marker).map(mrk => (
        <IconLabelWrap key={mrk.id}>
          <IconWrap addBackground={addBackground} flex={{ shrink: 0 }}>
            <KeyIconURI src={mrk.uri} markerSize={markerSize} />
          </IconWrap>
          <LabelWrap>
            <KeyLabel>{mrk.title}</KeyLabel>
          </LabelWrap>
        </IconLabelWrap>
      ))}
      {!simple && isIconMarker && (
        <Hint>
          <FormattedMessage {...messages.clickMarkerHint} />
        </Hint>
      )}
    </Box>
  );
}

Icon.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
  title: PropTypes.string,
  simple: PropTypes.bool,
  dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Icon);
