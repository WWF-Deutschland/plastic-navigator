import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { KeyArea } from 'components/KeyArea';
import { Box } from 'grommet';

const Styled = styled.div``;

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;
const IconImgWrap = styled.div`
  width: ${({ size }) => size.x}px;
`;
const IconImg = styled.img`
  width: 100%;
`;

export function CountryPositionSymbol({ icon, square }) {
  return (
    <Styled>
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
  icon: PropTypes.string,
  square: PropTypes.object,
};

export default CountryPositionSymbol;
