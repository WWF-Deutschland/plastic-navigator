import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';

export default styled(p => (
  <Box margin={{ top: 'medium' }} {...p} align="center" responsive={false} />
))``;
