import React from 'react';
import PropTypes from 'prop-types';

import { sankeyLinkHorizontal } from 'd3-sankey';

const FlowLink = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: link.type === 'active' ? '0.6' : '0.4',
      stroke: color,
      strokeWidth: Math.max(1, link.width),
    }}
  />
);

FlowLink.propTypes = {
  link: PropTypes.object,
  color: PropTypes.string,
};

export default FlowLink;
