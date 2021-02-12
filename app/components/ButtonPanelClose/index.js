/**
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';
import { Close } from 'components/Icons';

const ButtonPanelClose = styled(p => (
  <Button icon={<Close />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 10px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.brandDark};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDarker};
  }
`;

export default ButtonPanelClose;
