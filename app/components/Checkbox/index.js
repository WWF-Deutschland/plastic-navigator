import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';

import { Checkmark } from 'components/Icons';

const CheckButton = styled(p => <Button round="3px" plain {...p} />)`
  width: ${({ small }) => (small ? 15 : 18)}px;
  height: ${({ small }) => (small ? 15 : 18)}px;
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

const Label = styled(p => <Text size={p.labelSize || 'small'} {...p} />)``;

export function Checkbox({
  label,
  styledLabel,
  checked,
  onToggle,
  activeColor,
  inButton,
  labelSize,
  isDisabled,
}) {
  return (
    <Box
      direction="row"
      gap={labelSize || 'small'}
      align="center"
      flex={false}
      justify="start"
    >
      <Box flex={{ shrink: 0 }} style={{ position: 'relative' }}>
        {checked && (
          <ActiveCheckButton
            as={inButton ? 'span' : 'button'}
            activeColor={activeColor}
            onClick={() => !isDisabled && onToggle && onToggle()}
            small={labelSize === 'xsmall'}
          >
            <Checkmark
              color="white"
              style={{
                position: 'relative',
                top: labelSize === 'xsmall' ? '-5px' : '-3px',
              }}
              size={labelSize === 'xsmall' ? '12px' : '16px'}
            />
          </ActiveCheckButton>
        )}
        {!checked && (
          <CheckButton
            as={inButton ? 'span' : 'button'}
            onClick={() => !isDisabled && onToggle && onToggle()}
            small={labelSize === 'xsmall'}
          />
        )}
      </Box>
      {label && (
        <LabelButton
          label={<Label labelSize={labelSize}>{label}</Label>}
          onClick={() => !isDisabled && onToggle && onToggle()}
        />
      )}
      {styledLabel && (
        <LabelButton
          label={styledLabel}
          onClick={() => !isDisabled && onToggle && onToggle()}
        />
      )}
    </Box>
  );
}

Checkbox.propTypes = {
  onToggle: PropTypes.func,
  label: PropTypes.string,
  labelSize: PropTypes.string,
  inButton: PropTypes.bool,
  activeColor: PropTypes.string,
  checked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  styledLabel: PropTypes.node,
};

export default Checkbox;
