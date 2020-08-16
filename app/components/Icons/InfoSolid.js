import React from 'react';
import StyledIcon from './StyledIcon';
function InfoSolid(props) {
  return (
    <StyledIcon viewBox="0 0 30 30" a11yTitle="InfoSolid" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M15,5A10,10,0,1,0,25,15,10,10,0,0,0,15,5Zm.58,15H14.25V13h1.33Zm-.11-8.1a.76.76,0,0,1-.55.2.68.68,0,0,1-.5-.19.66.66,0,0,1-.2-.49.77.77,0,0,1,.2-.54.69.69,0,0,1,.5-.2.81.81,0,0,1,.55.2.66.66,0,0,1,.22.5A.67.67,0,0,1,15.47,11.9Z"
        />
      </g>
    </StyledIcon>
  );
}

export default InfoSolid;
