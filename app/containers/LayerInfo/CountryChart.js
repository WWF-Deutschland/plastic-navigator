/**
 *
 * CountryChart
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';
import { utcFormat as timeFormat } from 'd3-time-format';
import {
  FlexibleWidthXYPlot,
  LineSeries,
  AreaSeries,
  XAxis,
  VerticalGridLines,
  // YAxis,
  // MarkSeries,
  // Hint,
  // ChartLabel,
} from 'react-vis';

import { ArrowRightL } from 'components/Icons';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import { setLayerInfo } from 'containers/App/actions';
import { loadLayer } from 'containers/Map/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import saga from 'containers/Map/saga';

import { useInjectSaga } from 'utils/injectSaga';
import {
  getPositionStatsFromCountries,
  featuresToCountriesWithStrongestPosition,
  getSourceCountFromCountryFeatures,
  getCountryPositionsOverTimeFromCountryFeatures,
} from 'utils/policy';
import quasiEquals from 'utils/quasi-equals';

import KeyArea from 'components/KeyArea';
import KeyLabel from 'components/KeyFull/KeyLabel';

import coreMessages from 'messages';
import messages from './messages';

const Styled = styled(p => (
  <Box margin={{ top: 'medium', bottom: 'large' }} {...p} />
))``;
const SquareLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))``;

const KeyAreaWrap = styled.div`
  position: relative;
  height: 18px;
  width: 18px;
  padding: 0px;
`;

const StyledKeyLabel = styled(KeyLabel)`
  white-space: normal;
`;

const Title = styled(Text)`
  font-weight: bold;
  text-transform: uppercase;
`;
const SupTitle = styled(p => <Text size="xsmall" {...p} />)``;

const ListTitle = styled(p => <Text size="large" {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  line-height: 1;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  font-weight: normal;
`;

// prettier-ignore
const TitleButton = styled(p => (
  <Button {...p} plain fill="horizontal" alignSelf="start" />
))`
  border-top: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  border-bottom: 1px solid
    ${({ last, theme }) =>
    last ? theme.global.colors['light-4'] : 'transparent'};
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
`;
const getXTime = dateString => new Date(`${dateString}`).getTime();

const getDataForDate = (dateKey, positions, positionID, positionIDYOffset) => {
  let y = 0;
  if (positionIDYOffset && positions[dateKey].positions[positionIDYOffset]) {
    y += positions[dateKey].positions[positionIDYOffset].length;
  }
  return {
    sdate: dateKey,
    scount: positions[dateKey].positions[positionID]
      ? positions[dateKey].positions[positionID].length
      : 0,
    x: getXTime(dateKey),
    y: parseFloat(
      positions[dateKey].positions[positionID]
        ? y + positions[dateKey].positions[positionID].length
        : y,
    ),
  };
  // return addSteps(dataSimple);
};
const addStep = (previous, datum) => {
  if (previous.length > 0) {
    return [
      {
        ...datum,
        y: previous[previous.length - 1].y,
      },
      datum,
    ];
  }
  return [datum];
};
const prepChartData = (positions, minDate) => {
  const data = Object.keys(positions).reduce(
    (memo, dateKey) => ({
      1: [
        ...memo[1],
        ...addStep(memo[1], getDataForDate(dateKey, positions, 1)),
      ],
      2: [
        ...memo[2],
        ...addStep(memo[2], getDataForDate(dateKey, positions, 2, 1)),
      ],
    }),
    {
      1: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      2: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
    },
  );
  return {
    1: [
      ...data[1],
      {
        sdate: 'today',
        scount: 0,
        y: data[1][data[1].length - 1].y,
        x: new Date().getTime(),
      },
    ],
    2: [
      ...data[2],
      {
        sdate: 'today',
        scount: 0,
        y: data[2][data[2].length - 1].y,
        x: new Date().getTime(),
      },
    ],
  };
};

const prepChartKey = (countries, config, locale) => {
  const { key, featureStyle } = config;
  const countryStats = getPositionStatsFromCountries(config, countries);
  return key.values.reduce((memo, val) => {
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
    if (!stat) {
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
};

const MINDATE = '2018-07-01';

export function CountryChart({
  config,
  intl,
  onLoadLayer,
  layer,
  onClickLayerList,
}) {
  useInjectSaga({ key: 'map', saga });
  useEffect(() => {
    // kick off loading of page content
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      onLoadLayer(config.id, config);
    }
  }, [config]);

  const { locale } = intl;

  if (
    POLICY_LAYERS.indexOf(config.id) === -1 ||
    !layer ||
    !layer.data ||
    !layer.data.features
  ) {
    return null;
  }

  // console.log(layer.data.features)
  const sourceCount = getSourceCountFromCountryFeatures(
    config,
    layer.data.features,
  );
  const countries = featuresToCountriesWithStrongestPosition(
    config,
    layer.data.features,
    locale,
  );
  const countryStats = getPositionStatsFromCountries(config, countries);
  const statsForKey = prepChartKey(countries, config, locale);
  const positionsOverTime = getCountryPositionsOverTimeFromCountryFeatures(
    config,
    layer.data.features,
  );

  // const tickValuesY = getTickValuesY(metric.type, mode);
  // console.log(countries, countryStats);
  // console.log(positionsOverTime);
  // Object.keys(positionsOverTime).forEach(date => {
  //   const value = positionsOverTime[date];
  //   console.log(
  //     date,
  //     value.positions['1'] ? value.positions['1'].length : 0,
  //     value.positions['2'] ? value.positions['2'].length : 0,
  //   );
  // });

  const chartData = prepChartData(positionsOverTime, MINDATE);
  // console.log(chartData);
  // prettier-ignore
  const dataForceYRange =
    chartData && chartData[1] && chartData[1].length > 0
      ? [
        {
          x: new Date(MINDATE).getTime(),
          y: 0,
        },
        {
          x: new Date().getTime(),
          y: chartData[2][chartData[2].length - 1].y,
        },
      ]
      : null;
  const dataStyles = {
    1: statsForKey.find(s => s.id === '1'),
    2: statsForKey.find(s => s.id === '2'),
  };
  // console.log(statsForKey, dataForceYRange);
  // prettier-ignore
  return (
    <Styled>
      <Box gap="xxsmall">
        <Title>
          <FormattedMessage {...messages.countryChartTitle} />
        </Title>
        <SupTitle>
          <FormattedMessage {...messages.countryChartSupTitle} />
        </SupTitle>
      </Box>
      {(countryStats && countryStats.length > 1) && (
        <Box responsive={false} margin={{ vertical: 'small' }} gap="xxsmall">
          {statsForKey.map(stat => (
            <SquareLabelWrap key={stat.id}>
              <KeyAreaWrap>
                <KeyArea areaStyles={[stat.style]} />
              </KeyAreaWrap>
              <StyledKeyLabel>
                {!stat.count && stat.title}
                {!!stat.count && `${stat.title}: `}
                {!!stat.count && <strong>{stat.count}</strong>}
              </StyledKeyLabel>
            </SquareLabelWrap>
          ))}
        </Box>
      )}
      {chartData && dataForceYRange && (
        <FlexibleWidthXYPlot
          height={200}
          xType="time"
          style={{ fill: 'transparent' }}
          margin={{
            bottom: 30,
            top: 10,
            right: 18,
            left: 28,
          }}
        >
          <AreaSeries data={dataForceYRange} style={{ opacity: 0 }} />
          <AreaSeries
            data={chartData[2]}
            style={{
              stroke: 'transparent',
              fill: dataStyles && dataStyles[2] && dataStyles[2].style
                ? dataStyles[2].style.fillColor
                : 'red',
              opacity: dataStyles && dataStyles[2] &&  dataStyles[2].style
                ? dataStyles[2].style.fillOpacity
                : 0.1,
            }}
          />
          <AreaSeries
            data={chartData[1]}
            style={{
              stroke: 'transparent',
              fill: 'white',
              opacity: 1,
            }}
          />
          <AreaSeries
            data={chartData[1]}
            style={{
              stroke: 'transparent',
              fill: dataStyles && dataStyles[1] && dataStyles[1].style
                ? dataStyles[1].style.fillColor
                : 'blue',
              opacity: dataStyles && dataStyles[1] &&  dataStyles[1].style
                ? dataStyles[1].style.fillOpacity
                : 0.1,
            }}
          />
          <VerticalGridLines
            tickValues={[
              new Date('2019-01-01').getTime(),
              new Date('2020-01-01').getTime(),
              new Date('2021-01-01').getTime(),
            ]}
            style={{
              stroke: 'rgba(136, 150, 160, 0.4)',
            }}
          />
          <XAxis
            tickFormat={timeFormat('%Y')}
            tickSize={0}
            style={{
              line: { strokeWidth: 1, stroke: 'black' },
              text: {
                fill: 'black',
                fontSize: '12px',
              },
            }}
            tickValues={[
              new Date('2019-01-01').getTime(),
              new Date('2020-01-01').getTime(),
              new Date('2021-01-01').getTime(),
            ]}
            tickPadding={12}
          />
          <LineSeries
            data={chartData[2]}
            style={{
              stroke: dataStyles && dataStyles[2] && dataStyles[2].style
                ? dataStyles[2].style.fillColor
                : 'red',
              strokeWidth: 0.5,
            }}
          />
          <LineSeries
            data={chartData[1]}
            style={{
              stroke: dataStyles && dataStyles[1] && dataStyles[1].style
                ? dataStyles[1].style.fillColor
                : 'blue',
              strokeWidth: 0.5,
            }}
          />
        </FlexibleWidthXYPlot>
      )}
      {(countries || (sourceCount && sourceCount !== 0)) && (
        <Box pad={{ top: 'medium' }}>
          {countries && (
            <Box>
              <TitleButton
                onClick={() => onClickLayerList(config.id, 'countries')}
                label={
                  <Box
                    direction="row"
                    justify="between"
                    pad={{ vertical: 'small', right: 'small', left: 'edge' }}
                    align="center"
                    responsive={false}
                  >
                    <ListTitle>
                      <FormattedMessage
                        {...coreMessages.countries}
                        values={{
                          count: countries.length,
                          isSingle: countries.length === 1,
                        }}
                      />
                    </ListTitle>
                    <ArrowRightL />
                  </Box>
                }
              />
            </Box>
          )}
          {sourceCount && sourceCount !== 0 && (
            <Box>
              <TitleButton
                last
                onClick={() => onClickLayerList(config.id, 'sources')}
                label={
                  <Box
                    direction="row"
                    justify="between"
                    pad={{ vertical: 'small', right: 'small', left: 'edge' }}
                    align="center"
                    responsive={false}
                  >
                    <ListTitle>
                      <FormattedMessage
                        {...coreMessages.sources}
                        values={{
                          count: sourceCount,
                          isSingle: sourceCount === 1,
                        }}
                      />
                    </ListTitle>
                    <ArrowRightL />
                  </Box>
                }
              />
            </Box>
          )}
        </Box>
      )}
    </Styled>
  );
}

CountryChart.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
  onClickLayerList: PropTypes.func,
  config: PropTypes.object,
  layer: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layer: (state, { config }) => {
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      return selectLayerByKey(state, config.id);
    }
    return null;
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (id, config) => {
      dispatch(loadLayer(id, config));
    },
    onClickLayerList: (id, view) => {
      dispatch(setLayerInfo(id, view));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryChart));
