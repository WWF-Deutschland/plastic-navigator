import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';

import { Checkmark } from 'components/Icons';

const CheckButton = styled(p => <Button round="3px" plain {...p} />)`
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 3px;
  padding: 0px;
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
    </Box>
  );
}

Checkbox.propTypes = {
  onToggle: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
};

export default Checkbox;
