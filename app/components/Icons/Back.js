import React from 'react';
import StyledIcon from './StyledIcon';

function Back(props) {
  return (
    <StyledIcon size="16px" viewBox="0 0 16 16" a11yTitle="Back" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M16,7H3.83L9.42,1.41,8,0,0,8l8,8,1.41-1.41L3.83,9H16Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Back;
