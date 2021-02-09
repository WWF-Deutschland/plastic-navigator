import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';

import { Checkmark } from 'components/Icons';

const CheckButton = styled(p => <Button round="3px" plain {...p} />)`
  width: 18px;
  height: 18px;
  background: ${({ theme }) => theme.global.colors.light};
  border-radius: 3px;
  padding: 0 0 0 0;
  border: 1px solid ${({ theme }) => theme.global.colors['dark-4']};
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
`;
const ActiveCheckButton = styled(CheckButton)`
  background: black;
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
`;
const LabelButton = styled(p => <Button plain {...p} />)`
  margin-top: -1px;
`;

const Label = styled(p => <Text size="small" {...p} />)``;

export function Checkbox({ label, styledLabel, checked, onToggle }) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      flex={false}
      justify="start"
    >
      <Box flex={{ shrink: 0 }}>
        {checked && (
          <ActiveCheckButton
            icon={<Checkmark color="white" />}
            onClick={() => onToggle()}
          />
        )}
        {!checked && <CheckButton onClick={() => onToggle()} />}
      </Box>
      {label && (
        <LabelButton
          label={<Label>{label}</Label>}
          onClick={() => onToggle()}
        />
      )}
      {styledLabel && (
        <LabelButton label={styledLabel} onClick={() => onToggle()} />
      )}
    </Box>
  );
}

Checkbox.propTypes = {
  onToggle: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
  styledLabel: PropTypes.node,
};

export default Checkbox;
