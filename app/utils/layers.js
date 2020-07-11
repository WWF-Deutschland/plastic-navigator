export const getLayerFeatureIds = id => (id ? id.split('|') : ['']);

export const getLayerId = id => getLayerFeatureIds(id)[0];

export const findFeature = (features, featureId) =>
  features.find(f => f.properties.f_id === featureId);
