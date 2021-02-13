import { createSelector } from 'reselect';
import { selectRouterSearchParams } from 'containers/App/selectors';
import { getTransfersKey, getNodesKey } from './utils';

import { initialState } from './reducer';

export const selectAnalysis = createSelector(
  selectRouterSearchParams,
  search => (search.has('transfer') ? search.get('transfer') : null),
);

/**
 * Direct selector to the map state domain
 */

const selectDomain = state => state.panelTransfers || initialState;

/**
 * Other specific selectors
 */
export const selectData = createSelector(
  selectDomain,
  domain => domain.data,
);
export const selectDataByKey = createSelector(
  (state, key) => key,
  selectData,
  (key, data) => data[key],
);
export const selectDataForAnalysis = createSelector(
  (state, config) => config,
  selectData,
  (config, data) => {
    if (data && config) {
      const transfer = data[getTransfersKey(config)];
      let nodes;
      if (config.dir === 'uni') {
        // load 'from' nodes
        nodes = {
          from: data[getNodesKey(config, 'from')],
          to: data[getNodesKey(config, 'to')],
        };
      } else {
        nodes = data[getNodesKey(config)];
        if (nodes && config.id === 'countries') {
          nodes = nodes.filter(row => row.POL_TYPE === 'Union EEZ and country');
        }
      }
      return {
        transfer,
        nodes,
      };
    }
    return null;
  },
);
const selectDataRequested = createSelector(
  selectDomain,
  domain => domain.dataRequested,
);
export const selectDataRequestedByKey = createSelector(
  (state, key) => key,
  selectDataRequested,
  (key, data) => data[key],
);
const selectDataReady = createSelector(
  selectDomain,
  domain => domain.dataReady,
);
export const selectDataReadyByKey = createSelector(
  (state, key) => key,
  selectDataReady,
  (key, data) => data[key],
);
export const selectDataLoading = createSelector(
  selectDataReady,
  selectDataRequested,
  (ready, requested) => {
    if (!ready || !requested) return false;
    const dataReady = Object.keys(ready).length;
    const dataRequested = Object.keys(requested).reduce(
      (sum, id) => (requested[id] ? sum + 1 : sum),
      0,
    );
    return dataReady !== dataRequested;
  },
);
