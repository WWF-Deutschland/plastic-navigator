/**
 *
 * ModuleWrap
 *
 */
import React from 'react';
import styled from 'styled-components';

const ModuleWrap = styled(
  React.forwardRef((p, ref) => <div ref={ref} {...p} />),
)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: transparent;
  pointer-events: none;
  z-index: 2000;
`;

export default ModuleWrap;
