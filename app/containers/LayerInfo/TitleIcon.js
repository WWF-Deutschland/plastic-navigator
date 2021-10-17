import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import { ExploreS } from 'components/Icons';
import Title from './Title';

export function TitleIcon({ title }) {
  return (
    <Box margin={{ top: 'small' }} align="center" flex={false}>
      <ExploreS />
      <Title>{title}</Title>
    </Box>
  );
}

TitleIcon.propTypes = {
  title: PropTypes.string,
};

export default TitleIcon;
