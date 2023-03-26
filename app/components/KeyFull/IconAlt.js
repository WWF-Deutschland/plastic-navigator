import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
// import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { intlShape, injectIntl } from 'react-intl';
import Markdown from 'react-remarkable';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYER } from 'config';

import {
  excludeCountryFeatures,
  getPositionStatsFromCountries,
  featuresToCountriesWithStrongestPosition,
} from 'containers/LayerInfo/policy/utils';
import quasiEquals from 'utils/quasi-equals';

import KeyCircle from 'components/KeyCircle';

import KeyLabel from './KeyLabel';

const IconLabelWrap = styled(p => (
  <Box direction="row" align="start" gap="xsmall" {...p} />
))`
  position: relative;
  min-height: 22px;
`;

const IconWrap = styled.div`
  position: relative;
  top: -1px;
  display: block;
  height: 22px;
  width: 22px;
  padding: 1;
  border-radius: 9999px;
  background: ${({ backgroundColor, theme }) =>
    backgroundColor
      ? theme.global.colors[backgroundColor] || backgroundColor
      : 'transparent'};
`;

const KeyLabelWrap = styled(p => (
  <Box direction="row" align="start" alignContent="start" {...p} />
))``;

const StyledKeyLabel = styled(p => <KeyLabel {...p} />)`
  white-space: normal;
`;
const StyledKeyCount = styled(p => <KeyLabel {...p} />)`
  white-space: normal;
  width: 22px;
  font-weight: bold;
  text-align: right;
`;

export function IconAlt({
  config,
  intl,
  dark,
  layerData,
  simple,
  excludeEmpty,
}) {
  const { key } = config;
  const { locale } = intl;
  let circles;
  const countries =
    POLICY_LAYER === config.id &&
    layerData &&
    featuresToCountriesWithStrongestPosition(
      config,
      excludeCountryFeatures(config, layerData.features),
      locale,
    );

  const countryStats =
    countries && getPositionStatsFromCountries(config, countries);
  if (key.style && key.style.type === 'circle') {
    circles = key.iconValue.full.reduce((memo, val) => {
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
      if (excludeEmpty && (!stat || quasiEquals(stat.count, 0))) {
        return memo;
      }
      return [
        ...memo,
        {
          id: val,
          style,
          title: t,
          count: stat && stat.count,
        },
      ];
    }, []);
  }
  if (!circles) return null;
  const backgroundColor = dark && key.icon && key.icon.backgroundOnDark;
  // <KeyIconURI src={mrk.uri} markerSize={markerSize} />
  return (
    <Box gap="xsmall">
      {circles.map(circle => (
        <IconLabelWrap key={circle.id}>
          <IconWrap backgroundColor={backgroundColor}>
            <KeyCircle circleStyle={circle.style} radius={8} />
          </IconWrap>
          {!!circle.count && !simple && (
            <KeyLabelWrap flex={{ grow: 0, shrink: 0 }}>
              <StyledKeyCount>{circle.count}</StyledKeyCount>
            </KeyLabelWrap>
          )}
          <KeyLabelWrap>
            <StyledKeyLabel className="mpx-wrap-markdown-stat-title">
              <Markdown source={circle.title} />
            </StyledKeyLabel>
          </KeyLabelWrap>
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
  simple: PropTypes.bool,
  excludeEmpty: PropTypes.bool,
  dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(IconAlt);
