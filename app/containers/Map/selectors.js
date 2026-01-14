import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import memoizeOne from 'memoize-one';

import { POLICY_LAYER } from 'config';

import {
  selectConfigByKey,
  selectRouterSearchParams,
} from 'containers/App/selectors';

import qe from 'utils/quasi-equals';
import {
  getCountryPositionsOverTimeFromCountryFeatures,
  getTopicsFromData,
  isAggregate,
  getAggregatePositionsOverTime,
} from 'utils/policy';

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
export const selectHighlightFeature = createSelector(
  selectDomain,
  domain => domain.featureHighlight,
);

export const selectLayersLoading = createSelector(
  selectLayersReady,
  selectLayersRequested,
  (ready, requested) => {
    if (!ready || !requested) return false;
    const layersReady = Object.keys(ready).length;
    const layersRequested = Object.keys(requested).reduce(
      (sum, id) => (requested[id] ? sum + 1 : sum),
      0,
    );
    return layersReady !== layersRequested;
  },
);

export const selectMapPosition = createSelector(
  selectRouterSearchParams,
  search => (search.has('mview') ? search.get('mview') : ''),
);

export const selectTopics = createSelector(
  (state, props) =>
    (props && props.layerInfo) || selectLayerByKey(state, POLICY_LAYER),
  layerInfo => {
    if (!layerInfo || !layerInfo.data) return null;
    return getTopicsFromData(layerInfo);
  },
);

// Main selector - cached per topicId
const selectPositionsOverTimeForTopicBase = createCachedSelector(
  (state, { layerInfo }) => layerInfo,
  (state, { indicatorId }) => indicatorId,
  (layerInfo, indicatorId) =>
    getCountryPositionsOverTimeFromCountryFeatures({
      indicatorId,
      layerInfo,
    }),
)((state, { indicatorId }) => indicatorId);

const memoizedAggregate = memoizeOne(
  childPositions => getAggregatePositionsOverTime(childPositions),
  (newArgs, oldArgs) => {
    const [newObj] = newArgs;
    const [oldObj] = oldArgs;

    const newKeys = Object.keys(newObj);
    const oldKeys = Object.keys(oldObj);

    // Check if key count differs
    if (newKeys.length !== oldKeys.length) return false;

    // Compare each value by reference
    return newKeys.every(
      key =>
        Object.prototype.hasOwnProperty.call(oldObj, key) &&
        newObj[key] === oldObj[key],
    );
  },
);

export const selectPositionsOverTimeForTopic = createCachedSelector(
  state => state,
  (state, props) =>
    (props && props.layerInfo) || selectLayerByKey(state, POLICY_LAYER),
  (state, { indicatorId }) => indicatorId,
  selectTopics,
  (state, layerInfo, indicatorId, topics) => {
    if (!layerInfo || !layerInfo.data) return null;
    const topic = topics && topics.find(t => qe(t.id, indicatorId));
    const isTopicAggregate = topic && !!isAggregate(topic);
    if (!isTopicAggregate) {
      return selectPositionsOverTimeForTopicBase(state, {
        layerInfo,
        indicatorId,
      });
    }
    // Aggregate - call selector for each child
    const childTopicIds = topic.aggregate.trim().split(',');
    const childPositionsOverTime = childTopicIds.reduce(
      (memo, childId) => ({
        ...memo,
        [childId]: selectPositionsOverTimeForTopic(state, {
          indicatorId: childId,
          layerInfo,
        }),
      }),
      {},
    );
    return memoizedAggregate(childPositionsOverTime);
  },
)((state, { indicatorId }) => indicatorId);
