import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
// import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { intlShape, injectIntl } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import {
  getPositionStatsFromCountries,
  featuresToCountriesWithStrongestPosition,
} from 'utils/policy';
import quasiEquals from 'utils/quasi-equals';

import KeyCircle from 'components/KeyCircle';

import KeyLabel from './KeyLabel';

const IconLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))`
  position: relative;
`;

const IconWrap = styled(p => <Box flex={{ shrink: 0 }} {...p} />)`
  display: block;
  height: 22px;
  width: 22px;
  padding: 2px;
  border-radius: 9999px;
  background: ${({ backgroundColor, theme }) =>
    backgroundColor
      ? theme.global.colors[backgroundColor] || backgroundColor
      : 'transparent'};
`;

const StyledKeyLabel = styled(KeyLabel)`
  white-space: normal;
`;

export function IconAlt({ config, intl, dark, layerData }) {
  const { key } = config;
  const { locale } = intl;
  let circles;
  const countries =
    POLICY_LAYERS.indexOf(config.id) > -1 &&
    layerData &&
    featuresToCountriesWithStrongestPosition(
      config,
      layerData.features,
      locale,
    );
  const countryStats =
    countries && getPositionStatsFromCountries(config, countries);
  if (key.style && key.style.type === 'circle') {
    circles = key.iconValue.full.map(val => {
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
      const style = Object.keys(config.key.style).reduce(
        (styleMemo, attr) => {
          if (attr === 'type' || attr === 'property') return styleMemo;
          const attrObject = config.key.style[attr];
          // prettier-ignore
          const attrValue =
            attrObject[val] ||
            attrObject.default ||
            attrObject.none ||
            attrObject.without ||
            attrObject['0'];
          return {
            ...styleMemo,
            [attr]: attrValue,
          };
        },
        {
          weight: '0',
          fillOpacity: 1,
        },
      );
      const stat =
        countryStats && countryStats.find(s => quasiEquals(s.val, val));
      return {
        val,
        title: t,
        style,
        count: stat && stat.count,
      };
    });
  }
  if (!circles) return null;
  const backgroundColor = dark && key.icon && key.icon.backgroundOnDark;
  // <KeyIconURI src={mrk.uri} markerSize={markerSize} />
  return (
    <Box gap="xsmall">
      {circles.map(circle => (
        <IconLabelWrap key={circle.val}>
          <IconWrap backgroundColor={backgroundColor} flex={{ shrink: 0 }}>
            <KeyCircle circleStyle={circle.style} radius={8} />
          </IconWrap>
          <StyledKeyLabel>
            {!circle.count && circle.title}
            {!!circle.count && `${circle.title}: `}
            {!!circle.count && <strong>{circle.count}</strong>}
          </StyledKeyLabel>
        </IconLabelWrap>
      ))}
    </Box>
  );
}

IconAlt.propTypes = {
  // data: PropTypes.object,
  config: PropTypes.object,
  layerData: PropTypes.object,
  // title: PropTypes.string,
  // simple: PropTypes.bool,
  dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(IconAlt);
