import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Policy } from 'components/Icons';

import coreMessages from 'messages';

import Title from './Title';

const SupTitle = styled(p => <Text size="small" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledTitle = styled(p => <Title wide {...p} />)`
  font-size: 29px;
`;

export function TitleIcon({ title }) {
  return (
    <Box margin={{ top: 'small' }} align="center" flex={false}>
      <Policy />
      <Box margin={{ bottom: 'medium' }}>
        <SupTitle>
          <FormattedMessage {...coreMessages.module_policy} />
        </SupTitle>
      </Box>
      <StyledTitle>{title}</StyledTitle>
    </Box>
  );
}

TitleIcon.propTypes = {
  title: PropTypes.string,
};

export default TitleIcon;
