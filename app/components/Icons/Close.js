import React from 'react';
import StyledIcon from './StyledIcon';
function Close(props) {
  return (
    <StyledIcon size="30px" viewBox="0 0 30 30" a11yTitle="Close" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M23.29,24.71,15,16.41l-8.29,8.3L5.29,23.29,13.59,15,5.29,6.71,6.71,5.29,15,13.59l8.29-8.3,1.42,1.42L16.41,15l8.3,8.29Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Close;
