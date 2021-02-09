import React from 'react';
import StyledIcon from './StyledIcon';
function InfoSolid(props) {
  return (
    <StyledIcon
      size="30px"
      viewBox="0 0 30 30"
      a11yTitle="InfoSolid"
      {...props}
    >
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M15,5A10,10,0,1,0,25,15,10,10,0,0,0,15,5Zm1,15H14V13h2Zm0-9a1,1,0,1,1-1-1A1,1,0,0,1,16,11Z"
        />
      </g>
    </StyledIcon>
  );
}

export default InfoSolid;
