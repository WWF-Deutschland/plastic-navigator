import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Text } from 'grommet';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const StyledButton = styled(p => <Button alignSelf="end" plain {...p} />)`
  position: absolute;
  top: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  right: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  padding: 5px;
`;

const HeaderButtonText = styled(p => <Text size="medium" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 0;
`;

export function ButtonHide({ onClick, hasPadding }) {
  return (
    <StyledButton onClick={onClick} hasPadding={hasPadding}>
      <HeaderButtonText>
        <FormattedMessage {...messages.hidePanel} />
      </HeaderButtonText>
    </StyledButton>
  );
}

ButtonHide.propTypes = {
  onClick: PropTypes.func,
  hasPadding: PropTypes.bool,
};

export default ButtonHide;
