import React from 'react';
import StyledIcon from './StyledIcon';
function DropdownOpen(props) {
  return (
    <StyledIcon
      size="30px"
      viewBox="0 0 30 30"
      a11yTitle="DropdownOpen"
      {...props}
    >
      <g>
        <path fill="inherit" stroke="inherit" d="M2,6l6,6,6-6Z" />
      </g>
    </StyledIcon>
  );
}

export default DropdownOpen;
