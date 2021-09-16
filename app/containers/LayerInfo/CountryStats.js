/**
 *
 * CountryStats
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import { DEFAULT_LOCALE } from 'i18n';
import { startsWith } from 'utils/string';
import {
  getPositionSquareStyle,
  hexToRgba,
  getPositionStatsFromCountries,
} from 'utils/policy';

const StackedBarWrapper = styled.div`
  display: block;
  width: 100%;
  height: 22px;
  font-size: 0;
  margin-bottom: 5px;
`;
const Bar = styled.div`
  display: inline-block;
  position: relative;
  width: ${({ ratio }) => ratio * 100}%;
  height: 22px;
  border-style: ${({ bstyle }) => (bstyle && bstyle.stroke ? 'solid' : 'none')};
  border-width: ${({ bstyle }) => (bstyle && bstyle.weight) || 0}px;
  border-color: ${({ bstyle }) => bstyle && bstyle.color};
  background-color: ${({ bstyle }) =>
    bstyle && bstyle.fill ? bstyle.fillColor : 'transparent'};
  overflow: hidden;
`;
const AllLabelsWrapper = styled(p => (
  <Box direction="row" fill="horizontal" justify="between" {...p} />
))``;

const LabelWrapper = styled(Box)`
  text-align: ${({ align }) => align};
`;

const Count = styled(p => <Text size="large" {...p} weight="bold" />)``;

const Label = styled(p => <Text size="small" {...p} />)`
  max-width: 150px;
`;

const getTitle = (value, config, locale) => {
  if (config.key && config.key.title && config.key.title[value]) {
    return (
      config.key.title[value][locale] ||
      config.key.title[value][DEFAULT_LOCALE] ||
      config.key.title[value]
    );
  }
  if (
    config.key &&
    config.key.iconTitle &&
    config.key.iconTitle.full &&
    config.key.iconTitle.full[value]
  ) {
    return (
      config.key.iconTitle.full[value][locale] ||
      config.key.iconTitle.full[value][DEFAULT_LOCALE] ||
      config.key.iconTitle.full[value]
    );
  }
  return value;
};

export function CountryStats({ config, countries, intl }) {
  const { locale } = intl;
  const stats = getPositionStatsFromCountries(config, countries);
  // console.log(stats, config)
  // prettier-ignore
  if (stats &&  stats.length === 2) {
    return (
      <div>
        <StackedBarWrapper>
          {stats.map(({ val, count }) => {
            let bstyle = getPositionSquareStyle(val, config)
            if (
              bstyle.fillColor
              && bstyle.fillOpacity
              && startsWith(bstyle.fillColor, '#')
            ) {
              bstyle = {
                ...bstyle,
                fillColor: hexToRgba(bstyle.fillColor, bstyle.fillOpacity),
              };
            }
            return (
              <Bar
                key={val}
                ratio={count/countries.length}
                bstyle={bstyle}
              />
            );
          })}
        </StackedBarWrapper>
        <AllLabelsWrapper>
          {stats.map(({ val, count }, index) => (
            <LabelWrapper align={index === 0 ? 'start' : 'end'} key={val}>
              <Count>{count}</Count>
              <Label>{getTitle(val, config, locale)}</Label>
            </LabelWrapper>
          ))}
        </AllLabelsWrapper>
      </div>
    )
  }
  return null;
}

CountryStats.propTypes = {
  config: PropTypes.object,
  countries: PropTypes.array,
  intl: PropTypes.object,
};

export default injectIntl(CountryStats);
