/**
 *
 * ButtonDeleteLayers
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Text } from 'grommet';
import { CloseXS } from 'components/Icons';

const TabDelete = styled(p => <Button plain {...p} />)`
  position: absolute;
  bottom: 100%;
  border-radius: 9999px;
  background: white;
  left: 50%;
  transform: translate(-50%);
  min-width: 20px;
  height: 20px;
  color: black;
  text-align: center;
`;
const WrapContent = styled.span`
  pointer-events: none;
`;

export function ButtonDeleteLayers({ layerCount, updateLayers }) {
  const [hover, setHover] = useState(false);
  return (
    <TabDelete
      onClick={() => updateLayers()}
      label={
        <WrapContent>
          {hover ? (
            <CloseXS color="black" />
          ) : (
            <Text size="small">{layerCount}</Text>
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
