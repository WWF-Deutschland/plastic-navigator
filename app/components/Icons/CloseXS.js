import React from 'react';
import StyledIcon from './StyledIcon';

// Use in bubble for removing multiple layers
function CloseXS(props) {
  return (
    <StyledIcon size="16px" viewBox="0 0 16 16" a11yTitle="Close" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M9.41,8l3.3,3.29-1.42,1.42L8,9.41l-3.29,3.3L3.29,11.29,6.59,8,3.29,4.71,4.71,3.29,8,6.59l3.29-3.3,1.42,1.42Z"
        />
      </g>
    </StyledIcon>
  );
}

export default CloseXS;
