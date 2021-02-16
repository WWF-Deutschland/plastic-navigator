import React from 'react';
import PropTypes from 'prop-types';
import { sankey } from 'd3-sankey';

import FlowNode from './FlowNode';
import FlowLink from './FlowLink';

const NODE_PADDING = 10;
const NODE_WIDTH = 10;
const LABEL_WIDTH = 170;

const getNodeColor = node => (node.type === 'other' ? '#999999' : '#F07D00');

const getLinkColor = link => (link.type === 'other' ? '#999999' : '#F07D00');

// const getNodeColor = (node, activeNode) => {
//   // if (node.index !== 0 && node.key === activeNode.key) {
//   //   return '#00728F';
//   // }
//   return '#F07D00';
// };
//
// const getLinkColor = link => {
//   // if (link.source && link.target && link.source.key === link.target.key) {
//   //   return '#00728F';
//   // }
//   return '#F07D00';
// };

const ChartFlow = ({ data, width, height, direction, onSelectNode }) => {
  const totalHeight = data.links
    ? height + NODE_PADDING * (data.links.length - 1)
    : height;
  // prettier-ignore
  const { nodes, links } = sankey()
    .nodeWidth(NODE_WIDTH)
    .nodePadding(NODE_PADDING)
    .nodeSort((a, b) => (a.index > b.index ? 1 : -1))
    .linkSort((a, b) => (a.index > b.index ? 1 : -1))
    .extent([[LABEL_WIDTH, 0], [width - LABEL_WIDTH, totalHeight]])({
      ...data,
    });

  const singleNodeUpdated = nodes[0];
  const prevY0 = nodes[0].y0;
  singleNodeUpdated.y0 = (totalHeight - height) / 2;
  singleNodeUpdated.y1 = singleNodeUpdated.y0 + height;
  const diffY0 = singleNodeUpdated.y0 - prevY0;

  // prettier-ignore
  const linksUpdated = links.map(link =>
    direction === 'from'
      ? {
        ...link,
        y0: link.y0 + diffY0,
      }
      : {
        ...link,
        y1: link.y1 + diffY0,
      });
  return (
    <svg width={width} height={totalHeight + 10}>
      <g>
        {nodes.map(node => (
          <FlowNode
            {...node}
            direction={direction}
            key={node.index}
            color={getNodeColor(node, nodes[0])}
            onSelectNode={onSelectNode}
          />
        ))}
        {linksUpdated.map(link => (
          <FlowLink key={link.index} link={link} color={getLinkColor(link)} />
        ))}
      </g>
    </svg>
  );
};

ChartFlow.propTypes = {
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  direction: PropTypes.string,
  onSelectNode: PropTypes.func,
};

export default ChartFlow;
