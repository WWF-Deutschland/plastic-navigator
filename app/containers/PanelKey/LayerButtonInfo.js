import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const LayerButtonInfo = styled(p => <Button plain {...p} />)`
  padding: 0 ${({ theme }) => theme.global.edgeSize.xxsmall};
  border-radius: 9999px;
  margin-left: auto;
  &:hover {
    background: ${({ theme }) => theme.global.colors.lightHover};
  }
`;

export default LayerButtonInfo;
