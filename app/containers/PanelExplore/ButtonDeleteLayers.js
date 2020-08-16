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
  background: ${({ theme, tabActive }) =>
    theme.global.colors[tabActive ? 'white' : 'brandLight']};
  left: 50%;
  transform: translate(-50%);
  min-width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.global.colors.brandDark};
  text-align: center;
  font-weight: 600;
  &:hover {
    background: ${({ theme }) => theme.global.colors.white};
  }
`;
const WrapContent = styled(Box)`
  pointer-events: none;
`;

export function ButtonDeleteLayers({ layerCount, updateLayers, active }) {
  const [hover, setHover] = useState(false);
  return (
    <TabDelete
      tabActive={active}
      onClick={() => updateLayers()}
      label={
        <WrapContent justify="center" align="center">
          {hover ? (
            <CloseXS color="brandDark" />
          ) : (
            <Text size="xxsmall">{layerCount}</Text>
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
  active: PropTypes.bool,
};

export default ButtonDeleteLayers;
// export default PanelExplore;
