/**
 *
 * ButtonDeleteLayers
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Text, Box } from 'grommet';
import { CloseXS } from 'components/Icons';

const TabDelete = styled(p => <Button plain {...p} />)`
  position: absolute;
  bottom: 98%;
  border-radius: 9999px;
  background: white;
  left: 50%;
  transform: translate(-50%);
  min-width: 18px;
  height: 18px;
  color: ${({ theme }) => theme.global.colors.brandDark};
  text-align: center;
  font-weight: 600;
`;
const WrapContent = styled(Box)`
  pointer-events: none;
`;

export function ButtonDeleteLayers({ layerCount, updateLayers }) {
  const [hover, setHover] = useState(false);
  return (
    <TabDelete
      onClick={() => updateLayers()}
      label={
        <WrapContent justify="center" align="center">
          {hover ? (
            <CloseXS color="brandDark" />
          ) : (
            <Text size="xsmall">{layerCount}</Text>
          )}
        </WrapContent>
      }
      onMouseEnter={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onBlur={() => setHover(false)}
    />
  );
}

ButtonDeleteLayers.propTypes = {
  layerCount: PropTypes.number,
  updateLayers: PropTypes.func,
};

export default ButtonDeleteLayers;
// export default PanelExplore;
