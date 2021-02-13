export const getNodesKey = (config, fromOrTo) => {
  const key = config.id;
  if (config.dir === 'uni' && config.nodes[fromOrTo]) {
    return `${key}-nodes-${fromOrTo}`;
  }
  if (config.dir === 'omni') {
    return `${key}-nodes`;
  }
  return null;
};

export const getTransfersKey = config => `${config.id}-transfers`;
