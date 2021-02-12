import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';

export default styled(p => (
  <Box
    background="brand"
    justify="between"
    {...p}
    elevation="small"
    responsive={false}
  />
))`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 140px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: 150px;
  }
`;
