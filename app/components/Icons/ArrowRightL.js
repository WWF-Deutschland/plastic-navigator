import React from 'react';
import StyledIcon from './StyledIcon';

function ArrowRightL(props) {
  return (
    <StyledIcon
      size="16px"
      viewBox="0 0 16 16"
      a11yTitle="ArrowLeft"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M5.71,14.71,4.29,13.29,9.59,8,4.29,2.71,5.71,1.29,12.41,8Z"
        />
      </g>
    </StyledIcon>
  );
}

export default ArrowRightL;
