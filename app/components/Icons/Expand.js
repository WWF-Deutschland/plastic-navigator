import React from 'react';
import StyledIcon from './StyledIcon';
function Expand(props) {
  return (
    <StyledIcon
      size="20px"
      viewBox="0 0 20 20"
      a11yTitle="Expand"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M18.41,10l-5.7,5.71-1.42-1.42L14.59,11H7V9h7.59l-3.3-3.29,1.42-1.42ZM3,17H5V3H3Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Expand;
