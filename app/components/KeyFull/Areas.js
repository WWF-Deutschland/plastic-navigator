import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';
import Markdown from 'react-remarkable';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import quasiEquals from 'utils/quasi-equals';
import {
  excludeCountryFeatures,
  getPositionStatsFromCountries,
  featuresToCountriesWithStrongestPosition,
} from 'containers/LayerInfo/policy/utils';

import asArray from 'utils/as-array';

import KeyArea from 'components/KeyArea';
import KeyLabel from './KeyLabel';

// import messages from './messages';

const SquareLabelWrap = styled(p => (
  <Box direction="row" align="start" gap="xsmall" {...p} />
))`
  min-height: 18px;
`;

const KeyAreaWrap = styled.div`
  position: relative;
  top: -2px;
  height: 18px;
  width: 18px;
  padding: 0px;
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

export function Areas({
  config,
  intl,
  title,
  simple,
  layerData,
  excludeEmpty,
}) {
  const { key, featureStyle } = config;
  const { locale } = intl;
  let square = { style: { color: 'black' }, title, id: config.id };
  const countries =
    POLICY_LAYERS.indexOf(config.id) > -1 &&
    layerData &&
    featuresToCountriesWithStrongestPosition(
      config,
      excludeCountryFeatures(config, layerData.features),
      locale,
    );
  const countryStats =
    countries && getPositionStatsFromCountries(config, countries);

  if (featureStyle.multiple === 'true') {
    square = key.values.reduce((memo, val) => {
      let t;
      if (key.title && key.title[val]) {
        t =
          key.title[val][locale] ||
          key.title[val][DEFAULT_LOCALE] ||
          key.title[val];
      }
      let style;
      if (featureStyle && featureStyle.style) {
        style = Object.keys(featureStyle.style).reduce(
          (memo2, attr) => ({
            ...memo2,
            [attr]: featureStyle.style[attr][val],
          }),
          {
            fillOpacity: 0.4,
          },
        );
      }
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
  return (
    <Box gap={simple ? 'xxsmall' : 'xsmall'} responsive={false}>
      {asArray(square).map(sq => (
        <SquareLabelWrap key={sq.id}>
          <KeyAreaWrap>
            <KeyArea areaStyles={[sq.style]} />
          </KeyAreaWrap>
          <KeyLabelWrap flex={{ grow: 0, shrink: 0 }}>
            {!!sq.count && !simple && (
              <StyledKeyCount>{sq.count}</StyledKeyCount>
            )}
          </KeyLabelWrap>
          <KeyLabelWrap>
            <StyledKeyLabel className="mpx-wrap-markdown-stat-title">
              <Markdown source={sq.title} />
            </StyledKeyLabel>
          </KeyLabelWrap>
        </SquareLabelWrap>
      ))}
    </Box>
  );
}

Areas.propTypes = {
  config: PropTypes.object,
  layerData: PropTypes.object,
  title: PropTypes.string,
  simple: PropTypes.bool,
  excludeEmpty: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Areas);
