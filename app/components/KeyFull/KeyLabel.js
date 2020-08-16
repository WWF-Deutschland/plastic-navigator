import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

const KeyLabel = styled(p => <Text size="xsmall" {...p} />)`
  white-space: nowrap;
`;
export default KeyLabel;
