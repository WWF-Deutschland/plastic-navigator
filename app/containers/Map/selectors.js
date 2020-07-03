import { createSelector } from 'reselect';

import { selectConfigByKey } from 'containers/App/selectors';

import { initialState } from './reducer';

/**
 * Direct selector to the map state domain
 */

const selectDomain = state => state.map || initialState;

/**
 * Other specific selectors
 */

export const selectLayers = createSelector(
  selectDomain,
  domain => domain.layers,
);

export const selectLayerByKey = createSelector(
  (state, key) => key,
  selectLayers,
  (key, data) => data[key],
);

const selectLayersRequested = createSelector(
  selectDomain,
  domain => domain.layersRequested,
);
export const selectLayerRequestedByKey = createSelector(
  (state, key) => key,
  selectLayersRequested,
  (key, data) => data[key],
);

export const selectLayersReady = createSelector(
  selectDomain,
  domain => domain.layersReady,
);
export const selectLayerReadyByKey = createSelector(
  (state, key) => key,
  selectLayersReady,
  (key, data) => data[key],
);

export const selectLayerConfig = createSelector(
  state => selectConfigByKey(state, { key: 'layers' }),
  config => config,
);

export const selectMapLayers = createSelector(
  selectDomain,
  domain => domain.mapLayers,
);
