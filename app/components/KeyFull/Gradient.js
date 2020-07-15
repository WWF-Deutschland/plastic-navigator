import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyGradient from 'components/KeyGradient';

import { formatNumber } from 'utils/numbers';

import messages from './messages';

const Styled = styled(Box)`
  margin-right: ${({ exceeds }) => (exceeds ? 30 : 10)}px;
  margin-left: 10px;
`;
const GradientWrap = styled(Box)`
  position: relative;
  height: 20px;
`;

const GradientLabels = styled.div`
  position: relative;
  color: ${({ dark }) => (dark ? 'white' : 'black')};
  height: ${({ exceeds }) => (exceeds ? 40 : 20)}px;
`;

const KeyLabelWrap = styled(p => <Box {...p} align="center" />)`
  position: absolute;
  top: 0;
  left: ${({ offsetLeft }) => offsetLeft || '0'};
  transform: translate(-50%, 0);
`;
const KeyLabel = styled(p => <Text size="small" {...p} />)`
  white-space: nowrap;
`;
const Mark = styled.div`
  position: absolute;
  top: 0;
  left: ${({ offsetLeft }) => offsetLeft || 'auto'};
  bottom: 0;
  border-right: 1px solid white;
  width: 1px;
  transform: translateX(-0.5px);
`;

export function Gradient({ config, id, simple, intl, dark }) {
  const { key } = config;
  let stops;
  if (!simple) {
    const stopLast = key.stops[key.stops.length - 1];
    stops = key.stops.map(stop => ({
      left:
        key.scale === 'log'
          ? (Math.log10(stop.value) / Math.log10(stopLast.value)) * 100
          : (stop.value / stopLast.value) * 100,
      value: stop.value,
    }));
  }
  return (
    <Styled exceeds={key.exceed}>
      <GradientWrap>
        <KeyGradient
          id={id || config.id}
          stops={key.stops}
          log={key.scale === 'log'}
        />
        {!simple &&
          stops.map((stop, index) => {
            if (index > 0 && index < stops.length - 1) {
              return <Mark offsetLeft={`${stop.left}%`} />;
            }
            return null;
          })}
      </GradientWrap>
      {simple && (
        <GradientLabels dark={dark}>
          <KeyLabelWrap offsetLeft="0%">
            <KeyLabel>
              <FormattedMessage {...messages.less} />
            </KeyLabel>
          </KeyLabelWrap>
          <KeyLabelWrap offsetLeft="50%">
            <KeyLabel>
              <FormattedMessage {...messages[`by-${config.data.type}`]} />
            </KeyLabel>
          </KeyLabelWrap>
          <KeyLabelWrap offsetLeft="100%">
            <KeyLabel>
              <FormattedMessage {...messages.more} />
            </KeyLabel>
          </KeyLabelWrap>
        </GradientLabels>
      )}
      {!simple && (
        <GradientLabels dark={dark} exceeds={key.exceed}>
          {stops.map((stop, index) => (
            <KeyLabelWrap offsetLeft={`${stop.left}%`}>
              <KeyLabel>{formatNumber(stop.value, true, intl)}</KeyLabel>
              {index === stops.length - 1 && key.exceed && (
                <KeyLabel size="xsmall">
                  <FormattedMessage {...messages['and-more']} />
                </KeyLabel>
              )}
            </KeyLabelWrap>
          ))}
        </GradientLabels>
      )}
    </Styled>
  );
}

Gradient.propTypes = {
  config: PropTypes.object,
  id: PropTypes.string,
  simple: PropTypes.bool,
  dark: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Gradient);
