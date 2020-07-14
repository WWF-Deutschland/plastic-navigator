import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyGradient from 'components/KeyGradient';

import messages from './messages';

const Styled = styled(p => <Box {...p} fill />)`
  position: relative;
`;

const GradientWrap = styled(Box)`
  position: relative;
  height: 20px;
`;

const GradientLabels = styled(Box)`
  position: relative;
  color: ${({ dark }) => (dark ? 'white' : 'black')};
`;

const KeyLabel = styled(Text)`
  position: absolute;
  top: 0;
  left: ${({ offsetLeft }) => offsetLeft || 'auto'};
  right: ${({ offsetRight }) => offsetRight || 'auto'};
  transform: ${({ center }) => (center ? 'translate(-50%, 0)' : 'none')};
`;

export function KeyFull({ config, id, simple, intl, dark }) {
  const { key } = config;
  const isGradient = key && key.stops && key.type === 'continuous';
  let gradientStopAdditional;
  if (isGradient && !simple) {
    const stopAdd = key.stops[Math.floor(key.stops.length / 2) - 1];
    const stopLast = key.stops[key.stops.length - 1];
    gradientStopAdditional = {
      left:
        key.scale === 'log'
          ? (Math.log10(stopAdd.value) / Math.log10(stopLast.value)) * 100
          : (stopAdd.value / stopLast.value) * 100,
      value: stopAdd.value,
    };
  }
  return (
    <Styled>
      {isGradient && (
        <Box>
          <GradientWrap>
            <KeyGradient
              id={id || config.id}
              stops={key.stops}
              log={key.scale === 'log'}
            />
          </GradientWrap>
          {simple && (
            <GradientLabels dark={dark}>
              <KeyLabel offsetLeft="0%">
                <FormattedMessage {...messages.less} />
              </KeyLabel>
              <KeyLabel offsetLeft="50%" center>
                <FormattedMessage {...messages[`by-${config.data.type}`]} />
              </KeyLabel>
              <KeyLabel offsetRight="0%">
                <FormattedMessage {...messages.more} />
              </KeyLabel>
            </GradientLabels>
          )}
          {!simple && (
            <GradientLabels dark={dark}>
              <KeyLabel offsetLeft="0%">
                {intl.formatNumber(key.stops[0].value)}
              </KeyLabel>
              <KeyLabel offsetLeft={`${gradientStopAdditional.left}%`} center>
                {intl.formatNumber(gradientStopAdditional.value)}
              </KeyLabel>
              <KeyLabel offsetRight="0%">
                {intl.formatNumber(key.stops[key.stops.length - 1].value)}
                {key.exceed && key.exceed === 'true' && ' +'}
              </KeyLabel>
            </GradientLabels>
          )}
        </Box>
      )}
    </Styled>
  );
}

KeyFull.propTypes = {
  config: PropTypes.object,
  id: PropTypes.string,
  simple: PropTypes.bool,
  dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(KeyFull);
