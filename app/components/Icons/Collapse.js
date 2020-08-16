import React from 'react';
import StyledIcon from './StyledIcon';
function Collapse(props) {
  return (
    <StyledIcon
      size="16px"
      viewBox="0 0 16 16"
      a11yTitle="Collapse"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M8.41,8l5.3,5.29-1.42,1.42L5.59,8l6.7-6.71,1.42,1.42ZM2,15H4V1H2Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Collapse;
