import React from 'react';
import { Button } from 'grommet';
import styled from 'styled-components';

export default styled(p => <Button plain {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  line-height: 1;
  padding: 0 ${({ theme }) => theme.global.edgeSize.ms};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'white' : 'brandLight']};
  opacity: 1;
  border-bottom: 4px solid;
  border-color: ${({ theme, active }) =>
    active ? theme.global.colors.white : 'transparent'};
  &:hover {
    color: ${({ theme }) => theme.global.colors.white};
  }
`;
