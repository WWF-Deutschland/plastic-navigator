import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

export default styled(props => <Button plain {...props} />)`
  background: ${({ theme }) => theme.global.colors['white-trans']};
  opacity: 1;
  &:hover {
    background: white;
  }
`;
