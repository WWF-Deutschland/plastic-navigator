import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

export default styled(p => <Box gap="hair" {...p} />)`
  position: absolute;
  left: ${({ theme, position }) =>
    position === 'left' ? theme.global.edgeSize.ms : 'auto'};
  right: ${({ theme, position }) =>
    position === 'right' ? theme.global.edgeSize.ms : 'auto'};
  top: ${({ theme }) => theme.global.edgeSize.ms};
  z-index: 401;
`;
