import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';
import Markdown from 'react-remarkable';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYER } from 'config';

import formatDate from 'utils/format-date';
import quasiEquals from 'utils/quasi-equals';

import { prepChartKey } from 'containers/LayerInfo/policy/charts';

import asArray from 'utils/as-array';

import KeyArea from 'components/KeyArea';
import KeyLabel from './KeyLabel';

// import messages from './messages';

const SquareLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))`
  min-height: 18px;
`;

const KeyAreaWrap = styled.div`
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
  simple,
  layerInfo,
  indicatorId,
  positionsOverTime,
  chartDate,
}) {
  const { key, featureStyle } = config;
  const { locale } = intl;
  let squares = [];
  const isPolicy = POLICY_LAYER === config.id;
  // console.log('layerInfo', layerInfo);
  let keyDate;
  if (chartDate && positionsOverTime && positionsOverTime[chartDate]) {
    keyDate = chartDate;
  } else if (positionsOverTime) {
    keyDate = Object.keys(positionsOverTime)[
      Object.keys(positionsOverTime).length - 1
    ];
  }
  // const chartDate = lastDate;
  const statsForKey =
    positionsOverTime &&
    positionsOverTime[keyDate] &&
    positionsOverTime[keyDate].positions &&
    Object.keys(positionsOverTime).length > 0 &&
    prepChartKey({
      positionsForDate: positionsOverTime[keyDate].positions,
      tables: layerInfo.data.tables,
      indicatorId,
      config,
      locale,
      intl,
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
        statsForKey && statsForKey.find(s => quasiEquals(s.value, val));
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
  } else if (config['styles-by-value'] && statsForKey) {
    squares = statsForKey.sort((a, b) =>
      parseInt(a.id, 10) < parseInt(b.id, 10) ? 1 : -1,
    );
  } else if (config['styles-by-value'] && !statsForKey && !isPolicy) {
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
  const size = React.useContext(ResponsiveContext);
  return (
    <Box gap={size === 'small' ? 'small' : 'xsmall'} responsive={false}>
      {config['styles-by-value'] && statsForKey && keyDate && (
        <Box justify="start" flex={{ shrink: 0 }}>
          <Text color="textSecondary" size="xxxsmall">
            {formatDate(
              locale,
              keyDate ? new Date(keyDate).getTime() : new Date().getTime(),
            )}
          </Text>
        </Box>
      )}
      {asArray(squares)
        .filter(sq => typeof sq.count === 'undefined' || sq.count > 0)
        .map(sq => {
          const hasCount = typeof sq.count !== 'undefined' && !simple;
          return (
            <SquareLabelWrap key={sq.id}>
              <KeyAreaWrap>
                <KeyArea areaStyles={[sq.style]} />
              </KeyAreaWrap>
              <KeyLabelWrap>
                <StyledKeyLabel className="mpx-wrap-markdown-stat-title">
                  <Markdown source={hasCount ? `${sq.title}: ` : sq.title} />
                </StyledKeyLabel>
              </KeyLabelWrap>
              <KeyLabelWrap flex={{ grow: 0, shrink: 0 }}>
                {hasCount && <StyledKeyCount>{sq.count}</StyledKeyCount>}
              </KeyLabelWrap>
            </SquareLabelWrap>
          );
        })}
    </Box>
  );
}

Areas.propTypes = {
  config: PropTypes.object,
  layerInfo: PropTypes.object,
  positionsOverTime: PropTypes.object,
  indicatorId: PropTypes.string,
  chartDate: PropTypes.string,
  simple: PropTypes.bool,
  // excludeEmpty: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Areas);
