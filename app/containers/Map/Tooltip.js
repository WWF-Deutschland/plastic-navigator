import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Styled = styled.div`
  position: relative;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  z-index: 3000;
`;

const Inner = styled.div`
  position: absolute;
  top: 0;
  left: ${({ left }) => (left ? '-200px' : 'auto')};
  right: ${({ left }) => (!left ? 'auto' : '200px')};
  display: block;
  background: red;
  width: 200px;
  height: 100px;
`;

// const Tooltip = ({ position, feature, config, onClose, direction }) => {
const Tooltip = ({ position, direction }) => {
  console.log('tooltip');
  return (
    <Styled position={position}>
      <Inner left={direction.x === 'left'} />
    </Styled>
  );
};

Tooltip.propTypes = {
  position: PropTypes.object,
  direction: PropTypes.object, // x, y
  // feature: PropTypes.object,
  // config: PropTypes.object,
  // onClose: PropTypes.func,
};

export default Tooltip;
