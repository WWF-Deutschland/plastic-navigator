import React from 'react';
import styled from 'styled-components';
import { Heading } from 'grommet';

const Title = styled(p => <Heading level={1} {...p} />)`
  font-family: 'wwfregular';
  font-weight: normal;
  font-size: 32px;
  line-height: 1;
  letter-spacing: 0.1px;
  text-align: center;
  margin-top: 0px;
  margin-left: auto;
  margin-right: auto;
  max-width: ${({ wide }) => (wide ? '500px' : '350px')};
`;

export default Title;
