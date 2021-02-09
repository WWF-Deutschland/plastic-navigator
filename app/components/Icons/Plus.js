import React from 'react';
import StyledIcon from './StyledIcon';
function Plus(props) {
  return (
    <StyledIcon size="30px" viewBox="0 0 30 30" a11yTitle="Plus" {...props}>
      <g>
        <path
          fill="inherit"
          stroke="inherit"
          d="M21.5,14v2H16v5.5H14V16H8.5V14H14V8.5h2V14Z"
        />
      </g>
    </StyledIcon>
  );
}

export default Plus;
