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
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
`;
// prettier-ignore
const ActiveCheckButton = styled(CheckButton)`
  background: ${({ activeColor, theme }) =>
    activeColor ? theme.global.colors[activeColor] : 'black'};
  border: 1px solid
    ${({ theme, activeColor }) => theme.global.colors[activeColor || 'dark-4']};
  &:hover {
    background: ${({ activeColor, theme }) =>
    theme.global.colors[activeColor || 'dark']};
  }
`;
const LabelButton = styled(p => <Button plain {...p} />)`
  margin-top: -1px;
`;

const Label = styled(p => <Text size="small" {...p} />)``;

export function Checkbox({
  label,
  styledLabel,
  checked,
  onToggle,
  activeColor,
  inButton,
}) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      flex={false}
      justify="start"
    >
      <Box flex={{ shrink: 0 }} style={{ position: 'relative' }}>
        {checked && (
          <ActiveCheckButton
            as={inButton ? 'span' : 'button'}
            activeColor={activeColor}
            onClick={() => onToggle && onToggle()}
          >
            <Checkmark
              color="white"
              style={{ position: 'relative', top: '-3px' }}
            />
          </ActiveCheckButton>
        )}
        {!checked && (
          <CheckButton
            as={inButton ? 'span' : 'button'}
            onClick={() => onToggle && onToggle()}
          />
        )}
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
  inButton: PropTypes.bool,
  activeColor: PropTypes.string,
  checked: PropTypes.bool,
  styledLabel: PropTypes.node,
};

export default Checkbox;
