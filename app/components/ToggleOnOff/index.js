import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';
import qe from 'utils/quasi-equals';

const ToggleButton = styled(p => <Button plain {...p} />)`
  width: 38px;
  height: 18px;
  position: relative;
  background: ${({ theme }) => theme.global.colors.light};
  border-radius: 99px;
  padding: 0 0 0 0;
  border: 1px solid ${({ theme }) => theme.global.colors['dark-4']};
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
`;
const LabelButton = styled(p => <Button plain {...p} />)`
  margin-top: -1px;
`;

const Label = styled(p => <Text size={p.labelSize || 'small'} {...p} />)``;

const Knob = styled.div`
  display: block;
  background: black;
  width: 14px;
  height: 14px;
  border-radius: 99px;
  position: absolute;
  top: 1px;
  left: ${({ isActive }) => (isActive ? '1px' : 'auto')};
  right: ${({ isActive }) => (!isActive ? '1px' : 'auto')};
`;

export function ToggleOnOff({
  labelOn,
  labelOff,
  value,
  onChange,
  labelSize,
  isDisabled,
}) {
  console.log('isDisabled', isDisabled)
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      flex={false}
      justify="start"
    >
      {labelOn && (
        <LabelButton
          disabled={isDisabled}
          isActive={qe(value, 1)}
          label={<Label labelSize={labelSize}>{labelOn}</Label>}
          onClick={() => !isDisabled && onChange && onChange('1')}
        />
      )}
      <ToggleButton
        disabled={isDisabled}
        onClick={() =>
          !isDisabled && onChange && onChange(qe(value, 1) ? '0' : '1')
        }
        isActive={qe(value, 1)}
      >
        <Knob isActive={qe(value, 1)} />
      </ToggleButton>
      {labelOff && (
        <LabelButton
          disabled={isDisabled}
          isActive={qe(value, 0)}
          label={<Label labelSize={labelSize}>{labelOff}</Label>}
          onClick={() => !isDisabled && onChange && onChange('0')}
        />
      )}
    </Box>
  );
}

ToggleOnOff.propTypes = {
  onChange: PropTypes.func,
  labelSize: PropTypes.string,
  labelOn: PropTypes.string,
  labelOff: PropTypes.string,
  value: PropTypes.string,
  isDisabled: PropTypes.bool,
};

export default ToggleOnOff;
