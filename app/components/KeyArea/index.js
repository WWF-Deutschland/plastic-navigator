import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const Styled = styled.div`
  background: white;
  position: relative;
  width: 18px;
  height: 18px;
  overflow: hidden;
`;

const SVG = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export function KeyArea({ areaStyles }) {
  const rectHeight = 100 / areaStyles.length;
  const rects = areaStyles.map((style, index) => ({
    key: index,
    h: rectHeight,
    offset: index * rectHeight,
    ...style,
  }));
  return (
    <Styled>
      <SVG
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {rects.map(r => (
          <rect
            key={r.key}
            width="100"
            height={r.h}
            x="0"
            y={r.offset}
            stroke={r.color}
            strokeWidth="5"
            fill={r.fillColor}
            fillOpacity={r.fillOpacity}
          />
        ))}
      </SVG>
    </Styled>
  );
}

KeyArea.propTypes = {
  areaStyles: PropTypes.array,
};

export default KeyArea;
