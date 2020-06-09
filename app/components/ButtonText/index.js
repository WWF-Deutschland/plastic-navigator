/**
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const ButtonText = styled(props => <Button plain {...props} />)`
  text-decoration: underline;
  &:hover {
    color: ${({ theme }) => theme.global.colors.brand};
  }
`;

export default ButtonText;
