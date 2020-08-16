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
          d="M15,4.5A10.5,10.5,0,1,0,25.5,15,10.51,10.51,0,0,0,15,4.5Zm0,20A9.5,9.5,0,1,1,24.5,15,9.51,9.51,0,0,1,15,24.5ZM14.25,13h1.33v7H14.25Zm1.22-2.13a.66.66,0,0,1,.22.5.67.67,0,0,1-.22.52.76.76,0,0,1-.55.2.68.68,0,0,1-.5-.19.66.66,0,0,1-.2-.49.77.77,0,0,1,.2-.54.69.69,0,0,1,.5-.2A.81.81,0,0,1,15.47,10.88Z"
        />
      </g>
    </StyledIcon>
  );
}

export default InfoOutline;
