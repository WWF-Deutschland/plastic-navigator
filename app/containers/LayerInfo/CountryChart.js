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
import { Box, Text, Heading, Button } from 'grommet';
import { ArrowRightL } from 'components/Icons';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';
import saga from 'containers/Map/saga';

import { useInjectSaga } from 'utils/injectSaga';
import {
  getPositionStats,
  featuresToCountriesWithStrongestPosition,
  getSourcesFromCountryFeatures,
} from 'utils/positions';
import quasiEquals from 'utils/quasi-equals';

import KeyArea from 'components/KeyArea';
import KeyLabel from 'components/KeyFull/KeyLabel';

import messages from './messages';

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

const ListTitle = styled(p => <Heading level={4} {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  line-height: 1;
  margin-bottom: 15px;
  margin-top: 15px !important;
  font-weight: normal;
`;

const IconWrap = styled(p => <Box {...p} responsive={false} />)`
  padding: ${({ theme }) => theme.global.edgeSize.small};
  margin-left: ${({ stretch }) => (stretch ? 'auto' : 0)};
  border-radius: 9999px;
`;

const TitleButton = styled(Button)`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors.dark};
`;

export function CountryChart({ config, intl, onLoadLayer, layer }) {
  useInjectSaga({ key: 'map', saga });
  useEffect(() => {
    // kick off loading of page content
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      onLoadLayer(config.id, config);
    }
  }, [config]);

  const { locale } = intl;
  const { key, featureStyle } = config;

  if (
    POLICY_LAYERS.indexOf(config.id) === -1 ||
    !layer ||
    !layer.data ||
    !layer.data.features
  ) {
    return null;
  }
  // console.log(layer.data.features)
  const sources = getSourcesFromCountryFeatures(config, layer.data.features);
  // console.log(sources)
  const countries = featuresToCountriesWithStrongestPosition(
    config,
    layer.data.features,
    locale,
  );
  const countryStats = getPositionStats(config, countries);
  // console.log(countries, countryStats, config, key)

  const statsForKey = key.values.reduce((memo, val) => {
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

  // console.log(countries, countryStats)
  //   const { key, featureStyle } = config;
  // prettier-ignore
  return (
    <div>
      <Box>
        <Title>
          <FormattedMessage {...messages.countryChartTitle} />
        </Title>
      </Box>
      {(countryStats && countryStats.length > 1) && (
        <Box responsive={false}>
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
      {(countries || sources) && (
        <Box pad={{ top: 'medium' }}>
          {countries && (
            <Box>
              <TitleButton
                plain
                reverse
                label={
                  <Box
                    justify="between"
                    direction="row"
                    pad={{ top: 'edge', bottom: 'edge', left: 'xsmall' }}
                    align="center"
                    responsive={false}
                  >
                    <ListTitle>
                      {`Explore ${countries.length} countries`}
                    </ListTitle>
                    <IconWrap>
                      <ArrowRightL />
                    </IconWrap>
                  </Box>
                }
              />
            </Box>
          )}
          {sources && (
            <Box>
              <TitleButton
                plain
                reverse
                label={
                  <Box
                    justify="between"
                    direction="row"
                    pad={{ top: 'edge', bottom: 'edge', left: 'xsmall' }}
                    align="center"
                    responsive={false}
                  >
                    <ListTitle>
                      {`Explore ${Object.keys(sources).length} sources`}
                    </ListTitle>
                    <IconWrap>
                      <ArrowRightL />
                    </IconWrap>
                  </Box>
                }
              />
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

CountryChart.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
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
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryChart));
