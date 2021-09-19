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
  MarkSeries,
  // YAxis,
  // Hint,
  // ChartLabel,
} from 'react-vis';

import { ArrowRightL } from 'components/Icons';

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
} from './charts';

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

const YearLabel = styled.text`
  fill: black;
  font-size: 12px;
  text-anchor: start;
`;

const myTimeFormat = value => (
  <YearLabel dx="2">{timeFormat('%Y')(value)}</YearLabel>
);

const MINDATE = '2018-10-01';

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
  const statsForKey = prepChartKey(countryStats, config, locale);
  const positionsOverTime = getCountryPositionsOverTimeFromCountryFeatures(
    config,
    layer.data.features,
  );
  const chartData = prepChartData(positionsOverTime, MINDATE);
  const dataForceYRange = getYRange(chartData, MINDATE);
  const dataStyles = {
    1: statsForKey.find(s => s.id === '1'),
    2: statsForKey.find(s => s.id === '2'),
  };
  const tickValuesX = getTickValuesX(chartData);

  const chartDataSources = prepChartDataSources(positionsOverTime, dataStyles);
  console.log(chartDataSources, dataStyles);

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
          height={230}
          xType="time"
          style={{ fill: 'transparent' }}
          margin={{
            bottom: 30,
            top: 10,
            right: 25,
            left: 25,
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
              opacity: dataStyles && dataStyles[1] && dataStyles[1].style
                ? dataStyles[1].style.fillOpacity
                : 0.1,
            }}
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
          <VerticalGridLines
            tickValues={tickValuesX}
            style={{
              stroke: 'rgba(136, 150, 160, 0.4)',
            }}
          />
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
          <MarkSeries
            data={chartDataSources}
            size={3}
            colorType="literal"
            style={{ opacity: 0.7 }}
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
