import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import KeyCircle from 'components/KeyCircle';

import { scaleCircle, valueOfCircle } from 'containers/Map/utils';
import { formatNumber } from 'utils/numbers';

import KeyLabel from './KeyLabel';
import messages from './messages';

const Styled = styled(p => (
  <Box direction="row" gap="xsmall" justify="between" {...p} />
))`
  margin-right: 10px;
  margin-left: 10px;
  max-width: 300px;
`;

// const WrapCircle = styled(p => <Box pad="xxsmall" {...p} />)`
//   position: relative;
//   background: white;
//   border-radius: 9999px;
// `;
const WrapCircle = styled(p => <Box {...p} />)`
  position: relative;
`;
const CircleLabel = styled(p => <Box direction="row" gap="xsmall" {...p} />)`
  position: relative;
`;

const Less = styled.div`
  position: absolute;
  top: 100%;
  line-height: 13px;
`;

export function Circles({ config, simple, intl, range }) {
  const { key, render, style } = config;
  let minRadius = 10;
  let maxRadius = 20;
  if (simple && key['radius-simple'] && key['radius-simple'].less) {
    minRadius = parseFloat(key['radius-simple'].less);
  } else if (!simple) {
    minRadius = parseFloat(render.min || range.min);
  }
  if (simple && key['radius-simple'] && key['radius-simple'].more) {
    maxRadius = parseFloat(key['radius-simple'].more);
  } else if (!simple) {
    maxRadius = parseFloat(render.max);
  }

  return (
    <Styled
      exceeds={!simple && range && render && render.min}
      align={simple ? 'center' : 'end'}
    >
      <CircleLabel
        basis={simple || !range ? '1/2' : 'auto'}
        align={simple ? 'center' : 'end'}
        justify={simple ? 'center' : 'start'}
      >
        <WrapCircle>
          <KeyCircle circleStyle={style} radius={minRadius} />
        </WrapCircle>
        {simple && (
          <KeyLabel>
            <FormattedMessage {...messages.less} />
          </KeyLabel>
        )}
        {!simple && range && render && (
          <Box justify="center">
            <KeyLabel>
              {formatNumber(
                valueOfCircle(render.min || range.min, range, render),
                true,
                intl,
              )}
            </KeyLabel>
            {render.min && (
              <Less>
                <KeyLabel size="xxsmall" style={{ lineHeight: '13px' }}>
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
          <CircleLabel key={val} basis="auto" align={simple ? 'center' : 'end'}>
            <WrapCircle>
              <KeyCircle
                circleStyle={style}
                radius={scaleCircle(val, range, render)}
              />
            </WrapCircle>
            <KeyLabel>{formatNumber(val, true, intl)}</KeyLabel>
          </CircleLabel>
        ))}
      <CircleLabel
        basis={simple || !range ? '1/2' : 'auto'}
        align={simple ? 'center' : 'end'}
        justify={simple ? 'center' : 'start'}
      >
        <WrapCircle>
          <KeyCircle relative circleStyle={style} radius={maxRadius} />
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
