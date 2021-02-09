import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

// prettier-ignore
export default styled(p => <Button plain {...p} />)`
  text-align: left;
  padding: 2px ${({ theme }) => theme.global.edgeSize.small};
  display: block;
  width: 100%;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  opacity: 1;
  color: ${({ theme }) => theme.global.colors.black };
  border-top: 1px solid ${({ theme }) => theme.global.colors.border.light };
  border-left: 4px solid transparent;
  font-size: ${({ theme }) => theme.text.xsmall.size};
  min-width: 120px;
  &:last-child {
    border-bottom: 1px solid
      ${({ theme, noBorderLast }) => noBorderLast
    ? 'transparent'
    : theme.global.colors.border.light};
  }
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 4px 32px 4px 12px;
    font-size: ${({ theme }) => theme.text.medium.size};
  }
`;
