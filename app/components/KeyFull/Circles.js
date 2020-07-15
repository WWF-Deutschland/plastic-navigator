import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyCircle from 'components/KeyCircle';

import { scaleCircle, valueOfCircle } from 'containers/Map/utils';
import { formatNumber } from 'utils/numbers';

import messages from './messages';

const Styled = styled(p => <Box direction="row" align="center" {...p} />)`
  margin-right: 10px;
  margin-left: 10px;
`;

const KeyLabel = styled(p => <Text size="small" {...p} />)`
  white-space: nowrap;
`;

const WrapCircle = styled(p => <Box {...p} />)`
  position: relative;
`;
const CircleLabel = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))`
  position: relative;
`;

const Less = styled.div`
  position: absolute;
  top: 100%;
  line-height: 13px;
`;

export function Circles({ config, simple, intl, range }) {
  const { key, render } = config;

  return (
    <Styled
      height={`${config.render.max * 2}px`}
      exceeds={!simple && range && render && render.min}
    >
      <CircleLabel basis={simple || !range ? '1/2' : '1/3'}>
        <WrapCircle>
          <KeyCircle
            circleStyle={config.style}
            radius={parseFloat(render.min)}
          />
        </WrapCircle>
        {simple && (
          <KeyLabel>
            <FormattedMessage {...messages.less} />
          </KeyLabel>
        )}
        {!simple && range && render && (
          <Box justify="center">
            <div>
              <KeyLabel>
                {formatNumber(
                  valueOfCircle(render.min || range.min, range, render),
                  true,
                  intl,
                )}
              </KeyLabel>
            </div>
            {render.min && (
              <Less>
                <KeyLabel size="xsmall" style={{ lineHeight: '13px' }}>
                  <FormattedMessage {...messages['and-less']} />
                </KeyLabel>
              </Less>
            )}
          </Box>
        )}
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
            <KeyLabel>{formatNumber(val, true, intl)}</KeyLabel>
          </CircleLabel>
        ))}
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
          {!simple && range && formatNumber(range.max, true, intl)}
        </KeyLabel>
      </CircleLabel>
    </Styled>
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
