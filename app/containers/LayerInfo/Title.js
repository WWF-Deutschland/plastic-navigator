import React from 'react';
import styled from 'styled-components';
import { Heading } from 'grommet';

const Title = styled(p => <Heading level={1} {...p} />)`
  font-family: 'wwfregular';
  font-weight: normal;
  font-size: 32px;
  line-height: 40px;
  letter-spacing: 0.5px;
  text-align: center;
  margin-top: 0px;
  margin-left: auto;
  margin-right: auto;
  max-width: 350px;
`;

export default Title;
