import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Text, ResponsiveContext } from 'grommet';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const StyledButton = styled(p => <Button alignSelf="end" plain {...p} />)`
  position: absolute;
  top: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  right: ${({ hasPadding }) => (hasPadding ? 15 : 0)}px;
  padding: 5px;
  margin-top: -3px;
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderButtonText = styled(p => <Text size="medium" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 0;
`;

export function ButtonHide({ onClick, hasPadding }) {
  const size = React.useContext(ResponsiveContext);
  return (
    <StyledButton onClick={onClick} hasPadding={hasPadding}>
      <HeaderButtonText>
        {size !== 'small' && <FormattedMessage {...messages.hidePanel} />}
        {size === 'small' && <FormattedMessage {...messages.hidePanelSmall} />}
      </HeaderButtonText>
    </StyledButton>
  );
}

ButtonHide.propTypes = {
  onClick: PropTypes.func,
  hasPadding: PropTypes.bool,
};

export default ButtonHide;
