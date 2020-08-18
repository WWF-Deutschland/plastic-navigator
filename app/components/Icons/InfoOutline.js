import React from 'react';
import StyledIcon from './StyledIcon';
function InfoOutline(props) {
  return (
    <StyledIcon
      size="30px"
      viewBox="0 0 30 30"
      a11yTitle="InfoOutline"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M15,5A10,10,0,1,0,25,15,10,10,0,0,0,15,5Zm0,19a9,9,0,1,1,9-9A9,9,0,0,1,15,24ZM14,13h2v7H14Zm2-2a1,1,0,1,1-1-1A1,1,0,0,1,16,11Z"
        />
      </g>
    </StyledIcon>
  );
}

export default InfoOutline;
