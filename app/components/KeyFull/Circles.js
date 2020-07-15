import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyCircle from 'components/KeyCircle';

import { scaleCircle, valueOfCircle } from 'containers/Map/utils';

import messages from './messages';

const KeyLabel = styled(p => <Text {...p} size="xsmall" />)``;

const WrapCircle = styled(p => <Box {...p} />)`
  position: relative;
`;
const CircleLabel = styled(p => (
  <Box direction="row" fill="vertical" align="center" gap="xsmall" {...p} />
))`
  position: relative;
`;

export function Circles({ config, simple, intl, range }) {
  const { key, render } = config;

  return (
    <Box direction="row" height={`${config.render.max * 2}px`} align="center">
      <CircleLabel basis={simple || !range ? '1/2' : '1/3'}>
        <WrapCircle>
          <KeyCircle
            relative
            circleStyle={config.style}
            radius={parseFloat(config.render.max)}
          />
        </WrapCircle>
        <KeyLabel>
          {simple && <FormattedMessage {...messages.more} />}
          {!simple && range && intl.formatNumber(Math.floor(range.max))}
        </KeyLabel>
      </CircleLabel>
      {!simple &&
        range &&
        key.values &&
        key.values.map(val => (
          <CircleLabel key={val} basis="1/3">
            <WrapCircle>
              <KeyCircle
                circleStyle={config.style}
                radius={scaleCircle(val, range, config.render)}
              />
            </WrapCircle>
            <KeyLabel>{intl.formatNumber(val)}</KeyLabel>
          </CircleLabel>
        ))}
      <CircleLabel basis={simple || !range ? '1/2' : '1/3'}>
        <WrapCircle>
          <KeyCircle
            circleStyle={config.style}
            radius={parseFloat(render.min)}
          />
        </WrapCircle>
        <KeyLabel>
          {simple && <FormattedMessage {...messages.less} />}
          {!simple &&
            range &&
            render &&
            `< ${intl.formatNumber(
              Math.floor(valueOfCircle(render.min, range, render)),
            )}`}
        </KeyLabel>
      </CircleLabel>
    </Box>
  );
}

Circles.propTypes = {
  range: PropTypes.object,
  config: PropTypes.object,
  id: PropTypes.string,
  simple: PropTypes.bool,
  // dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Circles);
