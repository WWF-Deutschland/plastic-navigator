import React from 'react';
import StyledIcon from './StyledIcon';
function Checkmark(props) {
  return (
    <StyledIcon
      size="16px"
      viewBox="0 0 16 16"
      a11yTitle="Checkmark"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M6,12.41,2.29,8.71,3.71,7.29,6,9.59l6.29-6.3,1.42,1.42Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Checkmark;
