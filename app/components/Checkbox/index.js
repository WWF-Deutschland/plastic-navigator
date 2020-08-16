import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkmark } from 'grommet-icons';
import { Box, Button, Text } from 'grommet';

const CheckButton = styled(p => <Button round="3px" plain {...p} />)`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 3px;
  padding: 3px;
  border: 1px solid black;
`;
const ActiveCheckButton = styled(CheckButton)`
  background: black;
`;
const LabelButton = styled(p => <Button plain {...p} />)``;

const Label = styled(p => <Text size="small" {...p} />)``;

export function Checkbox({ label, checked, onToggle }) {
  return (
    <Box
      direction="row"
      gap="xsmall"
      align="center"
      flex={false}
      justify="start"
    >
      <Box flex={{ shrink: 0 }}>
        {checked && (
          <ActiveCheckButton
            icon={<Checkmark color="white" size="xsmall" />}
            onClick={() => onToggle()}
          />
        )}
        {!checked && <CheckButton onClick={() => onToggle()} />}
      </Box>
      <LabelButton label={<Label>{label}</Label>} onClick={() => onToggle()} />
    </Box>
  );
}

Checkbox.propTypes = {
  onToggle: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
};

export default Checkbox;
