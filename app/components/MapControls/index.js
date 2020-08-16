import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

// prettier-ignore
export default styled(p => <Box gap="hair" {...p} />)`
  position: absolute;
  left: ${({ theme, position }) =>
    position === 'left' ? theme.global.edgeSize.small : 'auto'};
  right: ${({ theme, position }) =>
    position === 'right' ? theme.global.edgeSize.small : 'auto'};
  top: ${({ theme, hasBrand }) =>
    theme.global.edgeSize[hasBrand ? 'ml' : 'ms']};
  z-index: 401;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    left: ${({ theme, position }) =>
    position === 'left' ? theme.global.edgeSize.medium : 'auto'};
    right: ${({ theme, position }) =>
    position === 'right' ? theme.global.edgeSize.medium : 'auto'};
    top: ${({ theme, hasBrand }) =>
    theme.global.edgeSize[hasBrand ? 'large' : 'medium']};
  }
`;
