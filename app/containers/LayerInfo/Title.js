import React from 'react';
import styled from 'styled-components';
import { Heading } from 'grommet';

const Title = styled(p => <Heading level={1} {...p} />)`
  font-family: 'wwfregular';
  font-weight: normal;
  font-size: 1.8em;
  line-height: 1.2;
  letter-spacing: 0.05em;
  text-align: center;
`;

export default Title;
