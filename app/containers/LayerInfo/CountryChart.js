/**
 *
 * CountryChart
 *
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import {
  FormattedMessage,
  FormattedDate,
  intlShape,
  injectIntl,
} from 'react-intl';
import styled from 'styled-components';
import { Box, Text, Button, ResponsiveContext } from 'grommet';
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

import { ArrowRightL } from 'components/Icons';
import LoadingIndicator from 'components/LoadingIndicator';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import { setLayerInfo } from 'containers/App/actions';
import { loadLayer } from 'containers/Map/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import saga from 'containers/Map/saga';

import { useInjectSaga } from 'utils/injectSaga';
import { isMinSize } from 'utils/responsive';
import {
  getPositionStatsFromCountries,
  featuresToCountriesWithStrongestPosition,
  getCountryPositionsOverTimeFromCountryFeatures,
  getSourceCountFromPositions,
  getSourcesFromCountryFeaturesWithPosition,
} from 'utils/policy';

import KeyArea from 'components/KeyArea';
import KeyLabel from 'components/KeyFull/KeyLabel';

import coreMessages from 'messages';
import messages from './messages';
import {
  prepChartKey,
  prepChartData,
  prepChartDataSources,
  getTickValuesX,
  getYRange,
  getMouseOverCover,
  getPlotHeight,
} from './charts';

const Styled = styled(p => (
  <Box margin={{ top: 'medium', bottom: 'large' }} {...p} />
))``;
const SquareLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))`
  min-height: 18px;
`;
const KeyLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xxsmall" {...p} />
))``;

const KeyAreaWrap = styled.div`
  position: relative;
  height: 18px;
  width: 18px;
  padding: 0px;
`;

const KeyStatements = styled(p => (
  <Box direction="row" gap="hair" align="center" {...p} />
))`
  height: 18px;
  width: 18px;
  padding: 0px;
`;

const StyledKeyLabel = styled(KeyLabel)`
  white-space: normal;
  font-weight: ${({ strong }) => (strong ? 'bold' : 'normal')};
`;

const Title = styled(Text)`
  font-weight: bold;
  text-transform: uppercase;
`;

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

const myTimeFormat = value => (
  <YearLabel dx="2">{timeFormat('%Y')(value)}</YearLabel>
);

const formatDate = (locale, time) => {
  if (Intl && Intl.DateTimeFormat) {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(time);
  }
  return (
    <FormattedDate value={time} year="numeric" month="numeric" day="numeric" />
  );
};

const MINDATE = '2018-10-01';

export function CountryChart({
  config,
  intl,
  onLoadLayer,
  layer,
  onSetLayerInfo,
}) {
  useInjectSaga({ key: 'map', saga });
  const [mouseOver, setMouseOver] = useState(false);
  const [nearestXDate, setNearestXDate] = useState(null);
  const [mouseOverSource, setMouseOverSource] = useState(null);

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
    return <LoadingIndicator />;
  }

  // console.log(layer.data.features)
  const countries = featuresToCountriesWithStrongestPosition(
    config,
    layer.data.features,
    locale,
  );
  const sources = getSourcesFromCountryFeaturesWithPosition(
    config,
    layer.data.features,
    locale,
  );
  const countryStats = getPositionStatsFromCountries(config, countries);
  const positionsOverTime = getCountryPositionsOverTimeFromCountryFeatures(
    config,
    layer.data.features,
  );
  // prettier-ignore
  const currentDate =
    !mouseOverSource && mouseOver && nearestXDate && positionsOverTime[nearestXDate]
      ? nearestXDate
      : Object.keys(positionsOverTime)[
        Object.keys(positionsOverTime).length - 1
      ];
  const positionsCurrentDate = positionsOverTime[currentDate].positions;
  const sourceCount = getSourceCountFromPositions(positionsOverTime);
  const sourceCountCurrent = getSourceCountFromPositions(
    positionsOverTime,
    currentDate,
  );
  const statsForKey = prepChartKey(positionsCurrentDate, config, locale);
  const chartData = prepChartData(positionsOverTime, MINDATE);
  const dataStyles = {
    1: statsForKey.find(s => s.id === '1'),
    2: statsForKey.find(s => s.id === '2'),
  };
  const tickValuesX = getTickValuesX(chartData);

  const chartDataSources = prepChartDataSources(positionsOverTime, dataStyles);
  // console.log(chartDataSources)
  const dataForceYRange = getYRange(chartData, chartDataSources, MINDATE);
  const dataMouseOverCover =
    !mouseOverSource &&
    mouseOver &&
    nearestXDate &&
    getMouseOverCover(chartData, currentDate);

  // prettier-ignore
  const statusTime =
    !mouseOverSource && mouseOver && nearestXDate
      ? new Date(nearestXDate).getTime()
      : new Date(
        Object.keys(positionsOverTime)[
          Object.keys(positionsOverTime).length - 1
        ],
      );

  const activeSource = mouseOverSource && sources[mouseOverSource.sid];
  // console.log(activeSource)
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
          {(countryStats && countryStats.length > 1) && (
            <Box
              responsive={false}
              margin={{ top: 'small' }}
              pad={{
                vertical: 'small',
                horizontal: isMinSize(size, 'medium') ? 'small' : 'xsmall',
              }}
              gap="xxsmall"
              elevation={!mouseOverSource && mouseOver ? 'small' : 'none'}
            >
              <Box direction={isMinSize(size, 'medium') ? 'row' : 'column'} justify="between" gap="xxsmall">
                <Box gap="xxsmall">
                  {statsForKey.map(stat => (
                    <SquareLabelWrap key={stat.id}>
                      <KeyAreaWrap>
                        <KeyArea areaStyles={[stat.style]} />
                      </KeyAreaWrap>
                      <KeyLabelWrap>
                        <StyledKeyLabel>
                          {!stat.count && stat.title}
                          {!!stat.count && `${stat.title}:`}
                        </StyledKeyLabel>
                        {!!stat.count && (
                          <StyledKeyLabel strong>
                            {stat.count}
                          </StyledKeyLabel>
                        )}
                      </KeyLabelWrap>
                    </SquareLabelWrap>
                  ))}
                  <SquareLabelWrap>
                    <KeyStatements>
                      {statsForKey.map(
                        stat => (
                          <KeySourceMarker
                            key={stat.id}
                            keyStyle={stat.style}
                          />
                        )
                      )}
                    </KeyStatements>
                    <KeyLabelWrap>
                      <StyledKeyLabel>
                        <FormattedMessage {...messages.countryChartNoSources} />
                      </StyledKeyLabel>
                      {!!sourceCountCurrent && (
                        <StyledKeyLabel strong>
                          {sourceCountCurrent}
                        </StyledKeyLabel>
                      )}
                    </KeyLabelWrap>
                  </SquareLabelWrap>
                </Box>
                <Box direction="row" gap="xsmall" justify={isMinSize(size, 'medium') ? 'end' : 'start'}>
                  <Text
                    size={isMinSize(size, 'medium') ? 'xxsmall' : 'xxxsmall'}
                    textAlign="end"
                    color="textSecondary"
                  >
                    <FormattedMessage {...messages.countryChartDateLabel} />
                  </Text>
                  <Text
                    size={isMinSize(size, 'medium') ? 'xxsmall' : 'xxxsmall'}
                    textAlign="end"
                    color="textSecondary"
                  >
                    {formatDate(locale, statusTime)}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
          <div style={{ position: 'relative' }}>
            {chartData && dataForceYRange && (
              <FlexibleWidthXYPlot
                height={getPlotHeight(size)}
                xType="time"
                style={{ fill: 'transparent' }}
                margin={{
                  bottom: 30,
                  top: 0,
                  right: 15,
                  left: 15,
                }}
                onMouseEnter={() => setMouseOver(true)}
                onMouseLeave={() => setMouseOver(false)}
              >
                {/* dummy series to make sure chart starts at 0 */}
                <AreaSeries data={dataForceYRange} style={{ opacity: 0 }} />
                {/* position 2 series as area */}
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
                {/* white background for position 1 series, covering pos 2 series */}
                <AreaSeries
                  data={chartData[1]}
                  style={{
                    stroke: 'transparent',
                    fill: 'white',
                    opacity: 1,
                  }}
                />
                {/* position 1 series as area */}
                <AreaSeries
                  data={chartData[1]}
                  style={{
                    stroke: 'transparent',
                    fill: dataStyles && dataStyles[1] && dataStyles[1].style
                      ? dataStyles[1].style.fillColor
                      : 'blue',
                    opacity: dataStyles && dataStyles[1] && dataStyles[1].style
                      ? dataStyles[1].style.fillOpacity
                      : 0.1,
                  }}
                />
                {/* position 2 series as line */}
                <LineSeries
                  data={chartData[2]}
                  style={{
                    stroke: dataStyles && dataStyles[2] && dataStyles[2].style
                      ? dataStyles[2].style.fillColor
                      : 'red',
                    strokeWidth: 0.5,
                  }}
                />
                {/* position 1 series as line */}
                <LineSeries
                  data={chartData[1]}
                  style={{
                    stroke: dataStyles && dataStyles[1] && dataStyles[1].style
                      ? dataStyles[1].style.fillColor
                      : 'blue',
                    strokeWidth: 0.5,
                  }}
                />
                {/* cover other areas series as background for source dots */}
                <AreaSeries
                  data={[
                    {
                      x: new Date(MINDATE).getTime(),
                      y: 0,
                    },
                    {
                      x: new Date().getTime(),
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
                  size={3}
                  colorType="literal"
                  style={{ opacity: 0.7 }}
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
                      x: new Date(MINDATE).getTime(),
                      y: 0,
                    },
                    {
                      x: new Date().getTime(),
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
                  tickFormat={myTimeFormat}
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
                    size={4}
                    colorType="literal"
                    style={{ opacity: 1, pointerEvents: 'none' }}
                  />
                )}
                {mouseOverSource && (
                  <Hint
                    value={mouseOverSource}
                    align={{ vertical: 'top', horizontal: 'auto' }}
                    style={{
                      transform: 'translateY(-10px)',
                      minWidth: '100px',
                      maxWidth: '120px',
                    }}
                  >
                    <Box elevation="small" background="white" pad="xsmall" gap="xsmall">
                      <Text size="xxxsmall" color="textSecondary">
                        {formatDate(locale, new Date(activeSource.date).getTime())}
                      </Text>
                      <Text size="xxsmall" weight="bold">
                        {activeSource[`title_${locale}`] || activeSource[`title_${DEFAULT_LOCALE}`]}
                      </Text>
                      <Text size="xxsmall">
                        <FormattedMessage
                          {...coreMessages.countries}
                          values={{
                            count: activeSource.countries.length,
                            isSingle: activeSource.countries.length === 1,
                          }}
                        />
                      </Text>
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
                  onValueMouseOver={point => {
                    setMouseOverSource(point)
                  }}
                  onValueMouseOut={() => {
                    setMouseOverSource(null)
                  }}
                  onValueClick={point => {
                    onSetLayerInfo(config.id, `source-${point.sid}`)
                  }}
                />
              </FlexibleWidthXYPlot>
            )}
          </div>
          {(countries || (sourceCount && sourceCount !== 0)) && (
            <Box pad={{ top: 'medium' }}>
              {countries && (
                <Box>
                  <TitleButton
                    onClick={() => onSetLayerInfo(config.id, 'countries')}
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
                    onClick={() => onSetLayerInfo(config.id, 'sources')}
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
      )}
    </ResponsiveContext.Consumer>
  );
}

CountryChart.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
  onSetLayerInfo: PropTypes.func,
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
    onSetLayerInfo: (id, view) => {
      dispatch(setLayerInfo(id, view));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryChart));
