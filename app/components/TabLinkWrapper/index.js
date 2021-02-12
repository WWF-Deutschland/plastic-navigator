import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';

export default styled(p => <Box {...p} margin={{ left: 'xsmall' }} />)`
  position: relative;
`;
