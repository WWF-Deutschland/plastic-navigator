import React from 'react';
import StyledIcon from './StyledIcon';
function Collapse(props) {
  return (
    <StyledIcon
      size="20px"
      viewBox="0 0 20 20"
      a11yTitle="Collapse"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M3,3H5V17H3ZM18,9H10.41l3.3-3.29L12.29,4.29,6.59,10l5.7,5.71,1.42-1.42L10.41,11H18Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Collapse;
