import quasiEquals from 'utils/quasi-equals';

// const [layerId, featureId, copyInfo] = getLayerFeatureIds(view);
export const decodeInfoView = view => (view ? view.split('|') : ['']);

export const getLayerIdFromView = view => decodeInfoView(view)[0];

export const findFeature = (features, featureId) =>
  features.find(f =>
    f.properties.code
      ? quasiEquals(f.properties.code, featureId)
      : quasiEquals(f.properties.f_id, featureId),
  );
