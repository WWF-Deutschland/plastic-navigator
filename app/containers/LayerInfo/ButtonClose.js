import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'grommet';
// import messages from './messages';
import { Close } from 'components/Icons';

const StyledButton = styled(p => <Button plain alignSelf="end" {...p} />)`
  position: absolute;
  top: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  right: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  padding: 5px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.black};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 10px;
    right: ${({ hasPadding }) => (hasPadding ? 30 : 0)}px;
  }
`;

export function ButtonClose({ onClick, hasPadding = true }) {
  return (
    <StyledButton
      hasPadding={hasPadding}
      onClick={onClick}
      icon={<Close color="white" />}
    />
  );
}

ButtonClose.propTypes = {
  onClick: PropTypes.func,
  hasPadding: PropTypes.bool,
};

export default ButtonClose;
