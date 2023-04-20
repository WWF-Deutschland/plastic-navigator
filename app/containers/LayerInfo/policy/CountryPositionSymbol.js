import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { KeyArea } from 'components/KeyArea';
import { Box } from 'grommet';

import { getCountryPositionSquareStyle } from './utils';

const Styled = styled(p => <Box flex={false} {...p} />)`
  margin: 0 auto;
`;

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;

export function CountryPositionSymbol({ position, config, inKey = true }) {
  const square = getCountryPositionSquareStyle({
    positionValue: position.value,
    config,
  });

  return (
    <Styled isLarge={inKey}>
      <AreaWrap>
        <KeyArea areaStyles={[square]} isLarge={!inKey} />
      </AreaWrap>
    </Styled>
  );
}

CountryPositionSymbol.propTypes = {
  position: PropTypes.object,
  config: PropTypes.object,
  inKey: PropTypes.bool,
};

export default CountryPositionSymbol;
