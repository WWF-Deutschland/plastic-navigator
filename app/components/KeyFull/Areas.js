import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';

import quasiEquals from 'utils/quasi-equals';
import { getPositionStats, featuresToCountries } from 'utils/positions';

import asArray from 'utils/as-array';

import KeyArea from 'components/KeyArea';
import KeyLabel from './KeyLabel';

// import messages from './messages';

const SquareLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))``;

const KeyAreaWrap = styled.div`
  position: relative;
  height: 22px;
  width: 22px;
  padding: 0px;
`;

const StyledKeyLabel = styled(KeyLabel)`
  white-space: normal;
`;

export function Areas({ config, intl, title, simple, layerData }) {
  const { key, featureStyle } = config;
  const { locale } = intl;
  let square = { style: { color: 'black' }, title, id: config.id };
  const countries =
    POLICY_LAYERS.indexOf(config.id) > -1 &&
    layerData &&
    featuresToCountries(config, layerData.features, locale);
  const countryStats = countries && getPositionStats(config, countries);
  if (featureStyle.multiple === 'true') {
    square = key.values.map(val => {
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
          (memo, attr) => ({
            ...memo,
            [attr]: featureStyle.style[attr][val],
          }),
          {
            fillOpacity: 0.4,
          },
        );
      }
      const stat =
        countryStats && countryStats.find(s => quasiEquals(s.val, val));
      return {
        id: val,
        style,
        title: t,
        count: stat && stat.count,
      };
    });
  }
  return (
    <Box gap={simple ? 'xxsmall' : 'xsmall'} responsive={false}>
      {asArray(square).map(sq => (
        <SquareLabelWrap key={sq.id}>
          <KeyAreaWrap>
            <KeyArea areaStyles={[sq.style]} />
          </KeyAreaWrap>
          <StyledKeyLabel>
            {!sq.count && sq.title}
            {!!sq.count && `${sq.title}: `}
            {!!sq.count && <strong>{sq.count}</strong>}
          </StyledKeyLabel>
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
  intl: intlShape.isRequired,
};

export default injectIntl(Areas);
