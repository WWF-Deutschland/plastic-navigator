/**
 *
 * CountryChart
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';
// import { Download } from 'grommet-icons';
import Markdown from 'react-remarkable';
import { utcFormat as timeFormat } from 'd3-time-format';
import {
  FlexibleWidthXYPlot,
  LineSeries,
  AreaSeries,
  XAxis,
  VerticalGridLines,
  MarkSeries,
  Hint,
} from 'react-vis';
// import CsvDownloader from 'react-csv-downloader';
//
// import { ArrowRightL } from 'components/Icons';
// import LoadingIndicator from 'components/LoadingIndicator';
//
import { DEFAULT_LOCALE } from 'i18n';
// import { POLICY_LAYER } from 'config';

import saga from 'containers/Map/saga';

import { useInjectSaga } from 'utils/injectSaga';
import { isMinSize } from 'utils/responsive';
import formatDate from 'utils/format-date';
import {
  // getCountryPositionStatsForTopicAndDate,
  getCountryPositionsOverTimeFromCountryFeatures,
} from 'utils/policy';

import KeyArea from 'components/KeyArea';
import KeyLabel from 'components/KeyFull/KeyLabel';

import coreMessages from 'messages';
// import {
//   // excludeCountryFeatures,
//   // getPositionStatsFromCountries,
//   // featuresToCountriesWithStrongestPosition,
//   // // getCountryPositionsOverTimeFromCountryFeatures,
//   // getSourceCountFromPositions,
//   // getSourcesFromCountryFeaturesWithPosition,
//   // getFlatCSVFromSources,
// } from './utils';
import messages from '../messages';
import {
  getXMax,
  prepChartKey,
  prepChartData,
  prepChartDataSources,
  getTickValuesX,
  getYRange,
  getMouseOverCover,
  getPlotHeight,
} from './charts';

const Styled = styled(p => <Box margin={{ bottom: 'small' }} {...p} />)``;
const SquareLabelWrap = styled(p => (
  <Box direction="row" align="start" gap="xsmall" {...p} />
))`
  min-height: 18px;
`;
const KeyLabelWrap = styled(p => (
  <Box direction="row" align="start" alignContent="start" {...p} />
))``;

const KeyAreaWrap = styled.div`
  position: relative;
  height: 18px;
  width: 18px;
  padding: 0px;
  top: -2px;
`;

const KeyStatements = styled(p => (
  <Box direction="row" align="center" justify="center" {...p} />
))`
  height: 18px;
  width: 18px;
  padding: 0px;
`;

const StyledKeyLabel = styled(p => <KeyLabel {...p} />)`
  white-space: normal;
`;
const StyledKeyCount = styled(p => <KeyLabel {...p} />)`
  white-space: normal;
  font-weight: bold;
`;

const Title = styled(Text)`
  font-weight: bold;
  text-transform: uppercase;
`;

// const ListTitle = styled(p => <Text size="large" {...p} />)`
//   font-family: 'wwfregular';
//   letter-spacing: 0.1px;
//   line-height: 1;
//   margin-bottom: 0 !important;
//   margin-top: 0 !important;
//   font-weight: normal;
// `;
//
// // prettier-ignore
// const TitleButton = styled(p => (
//   <Button {...p} plain fill="horizontal" alignSelf="start" />
// ))`
//   border-top: 1px solid ${({ theme }) => theme.global.colors['light-4']};
//   border-bottom: 1px solid
//     ${({ last, theme }) =>
//     last ? theme.global.colors['light-4'] : 'transparent'};
//   &:hover {
//     background: ${({ theme }) => theme.global.colors.light};
//   }
// `;

const YearLabel = styled.text`
  fill: black;
  font-size: 12px;
  text-anchor: start;
`;

const KeySourceMarker = styled.div`
  display: block;
  width: 8px;
  height: 8px;
  background: ${({ keyStyle }) => keyStyle.fillColor || 'red'};
  border-radius: 9999px;
  opacity: 0.7;
`;

const myTimeFormat = (value, intl) => {
  let formatted;
  if (new Date(value).getMonth() === 0) {
    formatted = timeFormat('%Y')(value);
  } else {
    formatted = intl.formatDate(value, { month: 'short' });
  }
  return <YearLabel dx="2">{formatted}</YearLabel>;
};

// const ButtonDownload = styled(props => <Button plain {...props} />)`
//   color: ${({ theme }) => theme.global.colors.dark};
//   stroke: ${({ theme }) => theme.global.colors.dark};
//   text-decoration: underline;
//   opacity: 0.7;
//   &:hover {
//     opacity: 1;
//     color: ${({ theme }) => theme.global.colors.brand};
//     stroke: ${({ theme }) => theme.global.colors.brand};
//   }
// `;

const MINDATE = {
  0: '2018-10-01',
  1: '2023-01-01',
  2: '2023-01-01',
  3: '2023-01-01',
  4: '2023-01-01',
};

export function CountryChart({
  config,
  layerInfo,
  onSelectStatement,
  indicatorId,
  intl,
  onSetChartDate,
  // chartDate,
}) {
  useInjectSaga({ key: 'map', saga });
  const [mouseOver, setMouseOver] = useState(false);
  const [nearestXDate, setNearestXDate] = useState(null);
  // const nearestXDate = chartDate || null;
  // const setNearestXDate = onSetChartDate || null;
  const [mouseOverSource, setMouseOverSource] = useState(null);

  const { locale } = intl;

  const positionsOverTime =
    layerInfo &&
    layerInfo.data &&
    getCountryPositionsOverTimeFromCountryFeatures({
      indicatorId,
      layerInfo,
      includeOpposing: false,
      includeWithout: false,
      includeHidden: false,
    });
  // console.log('positionsOverTime', positionsOverTime)
  // console.log('countryStats', countryStats)
  // console.log('positionsOverTime', positionsOverTime)
  const lastDate =
    layerInfo &&
    layerInfo.data &&
    Object.keys(positionsOverTime)[Object.keys(positionsOverTime).length - 1];

  useEffect(() => {
    if (lastDate && onSetChartDate) {
      onSetChartDate(lastDate);
    }
  }, [lastDate]);

  if (!layerInfo || !layerInfo.data) {
    return null;
  }

  // prettier-ignore
  const mouseOverEffect = mouseOver;
  const currentDate =
    mouseOverEffect && nearestXDate && positionsOverTime[nearestXDate]
      ? nearestXDate
      : lastDate;
  // const mouseOverEffect = !mouseOverSource && mouseOver
  // // figure out stats for key if static positions present ----------------------
  // let positionsOverTimeKey = positionsOverTime;
  // if (config.key.static) {
  //   positionsOverTimeKey = getCountryPositionsOverTimeFromCountryFeatures(
  //     config,
  //     featuresEx,
  //     true, // excludeStatic
  //   );
  // }
  // let currentDateKey = currentDate;
  // if (config.key.static) {
  //   if (
  //     !mouseOverSource &&
  //     mouseOver &&
  //     nearestXDate &&
  //     positionsOverTimeKey[nearestXDate]
  //   ) {
  //     currentDateKey = nearestXDate;
  //   } else {
  //     currentDateKey = Object.keys(positionsOverTimeKey)[
  //       Object.keys(positionsOverTimeKey).length - 1
  //     ];
  //   }
  // }
  const statsForKey = prepChartKey({
    positionsCurrentDate: positionsOverTime[currentDate].positions,
    positionsLatestDate: positionsOverTime[lastDate].positions,
    tables: layerInfo.data.tables,
    indicatorId,
    config,
    locale,
  });

  // console.log('statsForKey', statsForKey)
  // const statsForKeyByStatic = groupBy(statsForKey, s =>
  //   config.key.static && config.key.static.indexOf(s.id) > -1
  //     ? 'static'
  //     : 'dynamic',
  // );
  const statusTime = new Date(currentDate).getTime();
  // styles for each position ==================================================
  const dataStyles = config['styles-by-value'];
  // {
  //   1: statsForKey.find(s => s.id === '1'),
  //   2: statsForKey.find(s => s.id === '2'),
  //   3: statsForKey.find(s => s.id === '3'),
  //   4: statsForKey.find(s => s.id === '4'),
  // };
  //
  // // sources/statements
  // const sources = getSourcesFromCountryFeaturesWithPosition(
  //   config,
  //   featuresEx,
  //   locale,
  // );
  const chartDataSources = prepChartDataSources(positionsOverTime, dataStyles);
  // console.log('mouseOverSoure', mouseOverSource)
  const activeSource =
    mouseOverSource &&
    mouseOverSource.sources &&
    mouseOverSource.sources[Object.keys(mouseOverSource.sources)[0]];
  // mouseOverSource && chartDataSources[mouseOverSource.sid];
  // const activePositions = mouseOverSource && positionsOverTime[mouseOverSource.sdate];
  //
  // chart stuff
  const minDate = MINDATE[parseInt(indicatorId, 10)];
  const chartData = prepChartData({
    positions: positionsOverTime,
    minDate,
    maxDate: lastDate,
  });
  const tickValuesX = getTickValuesX({ chartData, minDate, maxDate: lastDate });
  // console.log('tickValuesX', tickValuesX)

  // console.log('chartDataSources', chartDataSources)
  const dataForceYRange = getYRange({
    countryCount: layerInfo.data.features.length,
    chartDataSources,
    minDate,
    maxDate: lastDate,
  });
  const dataMouseOverCover =
    mouseOverEffect &&
    nearestXDate &&
    getMouseOverCover({ chartData, minDate: currentDate, maxDate: lastDate });
  // console.log(getFlatCSVFromSources(sources, locale))

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled>
          <Box>
            <Title>
              <FormattedMessage {...messages.countryChartTitle} />
            </Title>
          </Box>
          {(statsForKey && statsForKey.length > 0) && (
            <Box
              responsive={false}
              margin={{ top: 'small' }}
              pad={{
                vertical: 'small',
                horizontal: isMinSize(size, 'medium') ? 'small' : 'xsmall',
              }}
              gap="xxsmall"
              elevation={mouseOverEffect ? 'small' : 'none'}
            >
              <Box justify="between" gap="xsmall">
                <Box gap="ms">
                  <Box gap="xsmall">
                    <Box
                      direction="row"
                      gap="xsmall"
                      justify="start"
                      flex={{ shrink: 0 }}
                    >
                      <Text
                        size={isMinSize(size, 'medium') ? 'xxsmall' : 'xxxsmall'}
                        textAlign="end"
                        color="textSecondary"
                      >
                        <FormattedMessage
                          {...messages.countryChartDateLabel}
                          values={{ date: formatDate(locale, statusTime) }}
                        />
                      </Text>
                    </Box>
                    {statsForKey.map(keyItem => {
                      const {count} = keyItem;
                      return (
                        <SquareLabelWrap key={keyItem.id}>
                          <KeyAreaWrap>
                            <KeyArea areaStyles={[keyItem.style]} />
                          </KeyAreaWrap>
                          <KeyLabelWrap>
                            <StyledKeyLabel className="mpx-wrap-markdown-stat-title">
                              <Markdown source={count ? `${keyItem.title}: ` : keyItem.title} />
                            </StyledKeyLabel>
                          </KeyLabelWrap>
                          <KeyLabelWrap flex={{ grow: 0, shrink: 0 }}>
                            {!!count && (
                              <StyledKeyCount>
                                {count}
                              </StyledKeyCount>
                            )}
                          </KeyLabelWrap>
                        </SquareLabelWrap>
                      );
                    })}
                  </Box>
                  <SquareLabelWrap align="center">
                    <KeyStatements>
                      {statsForKey.map(
                        stat => (
                          <KeySourceMarker
                            key={stat.id}
                            keyStyle={stat.style}
                            style={{
                              width: '4px',
                              height: '4px',
                            }}
                          />
                        )
                      )}
                    </KeyStatements>
                    <KeyLabelWrap>
                      <StyledKeyLabel>
                        <FormattedMessage {...messages.countryChartNoSources} />
                      </StyledKeyLabel>
                    </KeyLabelWrap>
                  </SquareLabelWrap>
                </Box>
              </Box>
            </Box>
          )}
          <div style={{ position: 'relative' }}>
            {chartData && dataForceYRange && (
              <FlexibleWidthXYPlot
                height={getPlotHeight({ size, hasStatements: true })}
                xType="time"
                style={{ fill: 'transparent' }}
                margin={{
                  bottom: 30,
                  top: 0,
                  right: 32,
                  left: 15,
                }}
                onMouseEnter={() => setMouseOver(true)}
                onMouseLeave={() => {
                  setMouseOver(false);
                  setNearestXDate(null);
                }}
              >
                {/* dummy series to make sure chart starts at 0 */}
                <AreaSeries data={dataForceYRange} style={{ opacity: 0 }} />
                {/* position 1 series as area */}
                {chartData[1] && dataStyles[1] && (
                  <AreaSeries
                    data={chartData[1]}
                    style={{
                      stroke: 'transparent',
                      fill: dataStyles[1].fillColor || 'red',
                      opacity: dataStyles[1].fillOpacity || 0.1,
                    }}
                  />
                )}
                {/* white background for position 2 series, covering pos 1 series */}
                {chartData[2] && (
                  <AreaSeries
                    data={chartData[2]}
                    style={{
                      stroke: 'transparent',
                      fill: 'white',
                      opacity: 1,
                    }}
                  />
                )}
                {/* position 2 series as area */}
                {chartData[2] && dataStyles[2] && (
                  <AreaSeries
                    data={chartData[2]}
                    style={{
                      stroke: 'transparent',
                      fill: dataStyles[2].fillColor || 'red',
                      opacity: dataStyles[2].fillOpacity || 0.1,
                    }}
                  />
                )}
                {/* white background for position 3 series, covering pos 1,2 series */}
                {chartData[3] && (
                  <AreaSeries
                    data={chartData[3]}
                    style={{
                      stroke: 'transparent',
                      fill: 'white',
                      opacity: 1,
                    }}
                  />
                )}
                {/* position 3 series as area */}
                {chartData[3] && dataStyles[3] && (
                  <AreaSeries
                    data={chartData[3]}
                    style={{
                      stroke: 'transparent',
                      fill: dataStyles[3].fillColor || 'red',
                      opacity: dataStyles[3].fillOpacity || 0.1,
                    }}
                  />
                )}
                {/* white background for position 3 series, covering pos 1,2 series */}
                {chartData[4] && (
                  <AreaSeries
                    data={chartData[4]}
                    style={{
                      stroke: 'transparent',
                      fill: 'white',
                      opacity: 1,
                    }}
                  />
                )}
                {/* position 3 series as area */}
                {chartData[4] && dataStyles[4] && (
                  <AreaSeries
                    data={chartData[4]}
                    style={{
                      stroke: 'transparent',
                      fill: dataStyles[4].fillColor || 'red',
                      opacity: dataStyles[4].fillOpacity || 0.1,
                    }}
                  />
                )}
                {/* position 1 series as line */}
                {dataStyles && Object.keys(dataStyles).map(key => {
                  const dataStyle = dataStyles[key];
                  const val = parseInt(key, 10);
                  // position 1 series as line
                  return (
                    <LineSeries
                      key={val}
                      data={chartData[val]}
                      style={{
                        stroke: dataStyle.fillColor || 'red',
                        strokeWidth: 0.5,
                      }}
                    />
                  );
                })}
                {/* indicate current date */}
                {dataMouseOverCover && (
                  <VerticalGridLines
                    tickValues={[new Date(currentDate).getTime()]}
                    style={{
                      stroke: 'black',
                    }}
                  />
                )}
                {/* cover other areas series as background below x axis */}
                <AreaSeries
                  data={[
                    {
                      x: new Date(minDate).getTime(),
                      y: 0,
                    },
                    {
                      x: getXMax(lastDate),
                      y: 0,
                    },
                  ]}
                  style={{
                    stroke: 'white',
                    fill: 'white',
                    opacity: 1,
                  }}
                />
                {/* source dots */}
                <MarkSeries
                  data={chartDataSources}
                  colorType="literal"
                  size={3}
                />
                {/* cover chart beyond current date */}
                {dataMouseOverCover && (
                  <AreaSeries
                    data={dataMouseOverCover}
                    style={{
                      stroke: 'none',
                      fill: 'white',
                      opacity: 0.7,
                    }}
                  />
                )}
                {/* indicate current date */}
                {dataMouseOverCover && (
                  <VerticalGridLines
                    tickValues={[new Date(currentDate).getTime()]}
                    style={{
                      stroke: 'black',
                    }}
                  />
                )}
                {/* fake x-axis at 0 */}
                <LineSeries
                  data={[
                    {
                      x: new Date(minDate).getTime(),
                      y: 0,
                    },
                    {
                      x: getXMax(lastDate),
                      y: 0,
                    },
                  ]}
                  style={{
                    strokeWidth: 1,
                    stroke: 'rgb(0,0,0)',
                    opacity: 1,
                  }}
                />
                {/* vertical gridlines */}
                <VerticalGridLines
                  tickValues={tickValuesX}
                  style={{
                    stroke: 'rgba(136, 150, 160, 0.4)',
                  }}
                />
                {/* tickmarks as vertical gridlines and date */}
                <XAxis
                  tickFormat={val => myTimeFormat(val, intl)}
                  tickSizeInner={0}
                  tickSizeOuter={20}
                  style={{
                    ticks: { strokeWidth: 1, stroke: 'rgba(136, 150, 160, 0.4)' },
                  }}
                  tickValues={tickValuesX}
                  tickPadding={-12}
                />
                {/* highlight source dot */}
                {mouseOverSource && (
                  <MarkSeries
                    data={[mouseOverSource]}
                    size={6}
                    colorType="literal"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {mouseOverSource && activeSource && (
                  <Hint
                    value={mouseOverSource}
                    align={{ vertical: 'top', horizontal: 'auto' }}
                    style={{
                      transform: 'translateY(-10px)',
                      minWidth: '100px',
                      maxWidth: '180px',
                    }}
                  >
                    <Box elevation="small" background="white" pad="xsmall">
                      <Box gap="xsmall">
                        <Text size="xxxsmall" color="textSecondary">
                          {formatDate(locale, new Date(mouseOverSource.sdate).getTime())}
                        </Text>
                        <Text size="xxsmall" weight="bold">
                          {activeSource[`title_${locale}`] || activeSource[`title_${DEFAULT_LOCALE}`]}
                        </Text>
                        <Text size="xxsmall">
                          <FormattedMessage
                            {...coreMessages.countries}
                            values={{
                              count: activeSource.countryCodes.length,
                              isSingle: activeSource.countryCodes.length === 1,
                            }}
                          />
                        </Text>
                      </Box>
                      {Object.keys(mouseOverSource.sources) && Object.keys(mouseOverSource.sources).length > 1 && (
                        <Box margin={{ top: 'xsmall' }}>
                          <Text size="xxxsmall" color="textSecondary">
                            <FormattedMessage
                              {...messages.otherStatements}
                              values={{
                                isSingle: Object.keys(mouseOverSource.sources).length === 2,
                                countOther: Object.keys(mouseOverSource.sources).length - 1,
                              }}
                            />
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Hint>
                )}
                {/* source dots interactions */}
                <MarkSeries
                  data={chartDataSources}
                  size={5}
                  colorType="literal"
                  style={{ opacity: 0, cursor: 'pointer' }}
                  onNearestX={point => {
                    if (point) {
                      setNearestXDate(point.sdate)
                    }
                  }}
                  onValueMouseOver={point => setMouseOverSource(point)}
                  onValueMouseOut={() => setMouseOverSource(null)}
                  onValueClick={point => onSelectStatement(point.sid)}
                />
              </FlexibleWidthXYPlot>
            )}
          </div>

        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

CountryChart.propTypes = {
  config: PropTypes.object,
  layerInfo: PropTypes.object,
  indicatorId: PropTypes.string,
  onSelectStatement: PropTypes.func,
  intl: intlShape.isRequired,
  onSetChartDate: PropTypes.func,
  // chartDate: PropTypes.string,
};

export default injectIntl(CountryChart);
