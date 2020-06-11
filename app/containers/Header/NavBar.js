import React from 'react';
import styled from 'styled-components';
import { Header } from 'grommet';
import { getHeaderHeight } from 'utils/responsive';

export default styled(props => (
  <Header {...props} align="start" pad={{ horizontal: 'medium' }} />
))`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.dimensions.header.zIndex};
  background: ${({ theme }) => theme.global.colors.header.background};
  /* responsive height */
  height: ${getHeaderHeight('small')}px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: ${getHeaderHeight('medium')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    height: ${getHeaderHeight('large')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    height: ${getHeaderHeight('xlarge')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    height: ${getHeaderHeight('xlarge')}px;
  }
`;
