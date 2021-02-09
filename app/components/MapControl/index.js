import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

export default styled(props => <Button plain {...props} />)`
  background: ${({ theme }) => theme.global.colors['light-trans']};
  opacity: 1;
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
`;
