import React from 'react';
import PropTypes from 'prop-types';

const FlowNode = ({ name, valueFormatted, x0, x1, y0, y1, color, align }) => {
  const h = y1 - y0;
  const w = x1 - x0;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill={color}>
        <title>{`${name} (${valueFormatted})`}</title>
      </rect>
      {h > 3 && (
        <text
          x={align === 'start' ? x0 + w + 4 : x0 - 4}
          y={y0 + h / 2 + 4}
          textAnchor={align}
          fontSize="10"
        >
          {`${valueFormatted} ${name}`}
        </text>
      )}
    </g>
  );
};

// {h > 6 && (
//   <text
//     x={align === 'start' ? x0 + w + 4 : x0 - 4}
//     y={y0 + h / 2 + 6}
//     textAnchor={align}
//     fontSize="8"
//   >
//     {valueFormatted}
//   </text>
// )}

FlowNode.propTypes = {
  name: PropTypes.string,
  valueFormatted: PropTypes.string,
  x0: PropTypes.number,
  x1: PropTypes.number,
  y0: PropTypes.number,
  y1: PropTypes.number,
  color: PropTypes.string,
  align: PropTypes.string,
};

export default FlowNode;
