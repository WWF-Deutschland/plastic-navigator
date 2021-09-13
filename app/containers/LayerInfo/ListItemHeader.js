import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Button } from 'grommet';
import { Back } from 'components/Icons';
import styled from 'styled-components';

const SupTitle = styled(p => <Button {...p} plain />)`
  text-transform: uppercase;
  font-weight: bold;
`;

const BackButton = styled(p => <Button {...p} plain />)`
  padding: 15px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.white};
  height: 40px;
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: 50px;
  }
`;

export function ListItemHeader({ onClick, title }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="xsmall"
      margin={{
        right: 'xlarge',
        bottom: 'medium',
        left: '-12px',
        top: 'xsmall',
      }}
    >
      <BackButton plain onClick={() => onClick()} icon={<Back />} />
      {title && (
        <SupTitle
          onClick={() => onClick(title)}
          label={<Text size="small">{title}</Text>}
        />
      )}
    </Box>
  );
}

ListItemHeader.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default ListItemHeader;
