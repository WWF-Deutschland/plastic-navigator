import React from 'react';
import StyledIcon from './StyledIcon';
function Expand(props) {
  return (
    <StyledIcon
      size="16px"
      viewBox="0 0 16 16"
      a11yTitle="Expand"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M13.71,8,7,14.71,5.59,13.29,10.88,8,5.59,2.71,7,1.29ZM2,15H4V1H2Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Expand;
