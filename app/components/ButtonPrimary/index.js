/**
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const ButtonPrimary = styled(props => <Button primary {...props} />)`
  font-weight: 600;
`;

export default ButtonPrimary;
