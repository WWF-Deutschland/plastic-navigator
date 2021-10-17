import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { KeyArea } from 'components/KeyArea';
import { Box } from 'grommet';
import KeyCircle from 'components/KeyCircle';

import {
  getPositionSquareStyle,
  getPositionCircleStyle,
  getPositionIcon,
} from 'utils/policy';

const Styled = styled.div`
  min-width: 30px;
  margin: 0 auto;
`;

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;
const IconImgWrap = styled.div`
  width: ${({ size }) => size.x}px;
`;

const IconCircleWrap = styled(p => <Box flex={{ shrink: 0 }} {...p} />)`
  display: block;
  margin: 0 auto;
  height: 22px;
  width: 22px;
  padding: 2px;
  border-radius: 9999px;
  background: ${({ backgroundColor, theme }) =>
    backgroundColor
      ? theme.global.colors[backgroundColor] || backgroundColor
      : 'transparent'};
`;

const IconImg = styled.img`
  width: 100%;
`;

export function CountryPositionSymbol({ position, config }) {
  const circle = getPositionCircleStyle(position, config);
  const icon = !circle && getPositionIcon(position, config);
  const square = !icon && !circle && getPositionSquareStyle(position, config);

  return (
    <Styled>
      {circle && (
        <IconCircleWrap>
          <KeyCircle circleStyle={circle.style} radius={8} />
        </IconCircleWrap>
      )}
      {icon && (
        <IconImgWrap size={{ x: 25, y: 25 }}>
          <IconImg src={icon} />
        </IconImgWrap>
      )}
      {square && (
        <AreaWrap>
          <KeyArea areaStyles={[square]} />
        </AreaWrap>
      )}
    </Styled>
  );
}

CountryPositionSymbol.propTypes = {
  position: PropTypes.object,
  config: PropTypes.object,
};

export default CountryPositionSymbol;
