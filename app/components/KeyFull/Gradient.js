import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyGradient from 'components/KeyGradient';

import { formatNumber } from 'utils/numbers';

import KeyLabel from './KeyLabel';
import messages from './messages';

const Styled = styled(Box)`
  margin-right: ${({ simple, exceedsTop }) => {
    if (simple) return 20;
    return exceedsTop ? 30 : 10;
  }}px;
  margin-left: ${({ simple, exceedsBottom }) => {
    if (simple) return 20;
    return exceedsBottom ? 30 : 10;
  }}px;
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
const Mark = styled.div`
  position: absolute;
  top: 0;
  left: ${({ offsetLeft }) => offsetLeft || 'auto'};
  bottom: 0;
  border-right: 1px solid white;
  width: 1px;
  transform: translateX(-0.5px);
`;

const isExceedsTop = exceeds => exceeds === 'true' || exceeds === 'top';
const isExceedsBottom = exceeds => exceeds === 'true' || exceeds === 'bottom';

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
  const xTop = isExceedsTop(key.exceed);
  const xBottom = isExceedsBottom(key.exceed);
  return (
    <Styled simple={simple} exceedsTop={xTop} exceedsBottom={xBottom}>
      <GradientWrap margin={{ bottom: 'xxsmall' }}>
        <KeyGradient
          id={id || config.id}
          stops={key.stops}
          log={key.scale === 'log'}
        />
        {!simple &&
          stops.map((stop, index) => {
            if (index > 0 && index < stops.length - 1) {
              return <Mark key={stop.value} offsetLeft={`${stop.left}%`} />;
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
            <KeyLabelWrap key={stop.value} offsetLeft={`${stop.left}%`}>
              <KeyLabel>{formatNumber(stop.value, true, intl)}</KeyLabel>
              {index === 0 && xBottom && (
                <KeyLabel size="xxsmall">
                  <FormattedMessage {...messages['and-less']} />
                </KeyLabel>
              )}
              {index === stops.length - 1 && xTop && (
                <KeyLabel size="xxsmall">
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
