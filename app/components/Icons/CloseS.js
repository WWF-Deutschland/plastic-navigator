import React from 'react';
import StyledIcon from './StyledIcon';

// Use for closing map tooltips
function CloseS(props) {
  return (
    <StyledIcon size="30x" viewBox="0 0 30 30" a11yTitle="Close" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M16.41,15l5.3,5.29-1.42,1.42L15,16.41l-5.29,5.3L8.29,20.29,13.59,15,8.29,9.71,9.71,8.29,15,13.59l5.29-5.3,1.42,1.42Z"
        />
      </g>
    </StyledIcon>
  );
}

export default CloseS;
