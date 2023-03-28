import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';
import Markdown from 'react-remarkable';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYER } from 'config';

import quasiEquals from 'utils/quasi-equals';
import { getCountryPositionStatsForTopicAndDate } from 'utils/policy';
// import {
//   excludeCountryFeatures,
//   getPositionStatsFromCountries,
//   featuresToCountriesWithStrongestPosition,
// } from 'containers/LayerInfo/policy/utils';

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
  indicatorId,
}) {
  const { key, featureStyle } = config;
  const { locale } = intl;
  let squares = [{ style: { color: 'black' }, title, id: config.id }];
  const isPolicy = POLICY_LAYER === config.id;
  // const countries =
  //   isPolicy &&
  //   layerData &&
  //   featuresToCountriesWithStrongestPosition(
  //     config,
  //     excludeCountryFeatures(config, layerData.features),
  //     locale,
  //   );
  const countryStats =
    isPolicy &&
    layerData &&
    getCountryPositionStatsForTopicAndDate({
      config,
      layerData,
      indicatorId,
    });

  if (featureStyle && featureStyle.multiple === 'true') {
    squares = key.values.reduce((memo, val) => {
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
  } else if (config['styles-by-value'] && countryStats) {
    squares = countryStats
      .map(stat => ({
        id: stat.id,
        title:
          stat[`position_short_${locale}`] ||
          stat[`position_short_{DEFAULT_LOCALE}`],
        style: config['styles-by-value'][stat.id],
        count: parseInt(stat.count, 10),
      }))
      .filter(stat => {
        if (excludeEmpty && stat.count === 0) {
          return false;
        }
        return parseInt(stat.id, 10) > 0;
      })
      .sort((a, b) => (parseInt(a.id, 10) < parseInt(b.id, 10) ? 1 : -1));
  } else if (config['styles-by-value'] && !countryStats) {
    squares = Object.keys(config['styles-by-value'])
      .filter(val => {
        const style = config['styles-by-value'][val];
        return typeof style.key === 'undefined' || style.key;
      })
      .sort((a, b) => (parseInt(a, 10) < parseInt(b, 10) ? 1 : -1))
      .map(val => {
        const t = val;
        const style = config['styles-by-value'][val];
        return {
          id: val,
          title: t,
          style,
        };
      });
  }
  return (
    <Box gap={simple ? 'xxsmall' : 'xsmall'} responsive={false}>
      {asArray(squares).map(sq => (
        <SquareLabelWrap key={sq.id}>
          <KeyAreaWrap>
            <KeyArea areaStyles={[sq.style]} />
          </KeyAreaWrap>
          <KeyLabelWrap flex={{ grow: 0, shrink: 0 }}>
            {typeof sq.count !== 'undefined' && !simple && (
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
  indicatorId: PropTypes.string,
  simple: PropTypes.bool,
  excludeEmpty: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Areas);
