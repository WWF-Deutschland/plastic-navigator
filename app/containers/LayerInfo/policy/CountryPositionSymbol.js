import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { KeyArea } from 'components/KeyArea';
import { Box } from 'grommet';

import { getCountryPositionSquareStyle } from './utils';

const Styled = styled(p => <Box flex={false} {...p} />)`
  width: 20px;
  margin: 0 auto;
`;

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;

export function CountryPositionSymbol({ position, config }) {
  const square = getCountryPositionSquareStyle({
    positionValue: position.value,
    config,
  });

  return (
    <Styled>
      <AreaWrap>
        <KeyArea areaStyles={[square]} />
      </AreaWrap>
    </Styled>
  );
}

CountryPositionSymbol.propTypes = {
  position: PropTypes.object,
  config: PropTypes.object,
};

export default CountryPositionSymbol;
