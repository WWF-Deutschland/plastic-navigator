/**
 * The global state selectors
 */
import { createSelector } from 'reselect';
import { DEFAULT_LOCALE, appLocales } from 'i18n';

import { URL_SEARCH_SEPARATOR, PROJECT_CONFIG } from 'config';

import { startsWith } from 'utils/string';
import isNumber from 'utils/is-number';

import { initialState } from './reducer';

const selectGlobal = state => state.global || initialState;

export const selectRouter = state => state.router;

export const selectRouterLocation = createSelector(
  selectRouter,
  routerState => routerState.location,
);
export const selectRouterPath = createSelector(
  selectRouterLocation,
  location => location && location.pathname,
);
export const selectRouterSearchParams = createSelector(
  selectRouterLocation,
  location => location && new URLSearchParams(location.search),
);
export const selectPageSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('page') ? search.get('page') : ''),
);
export const selectLayersSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('layers') ? search.get('layers') : ''),
);
export const selectInfoSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('info') ? search.get('info') : ''),
);
export const selectItemInfoSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('item') ? search.get('item') : ''),
);
export const selectChapterSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('ch') ? parseInt(search.get('ch'), 10) : null),
);
export const selectStorySearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('st') ? parseInt(search.get('st'), 10) : null),
);
export const selectIFrameSearch = createSelector(
  selectRouterSearchParams,
  search => (search.has('iframe') ? search.get('iframe') : null),
);

/**
 * Get the language locale
 */
export const selectLocale = createSelector(
  selectRouterPath,
  path => {
    if (path) {
      const splitPath = path.split('/');
      return splitPath.length > 1 && appLocales.indexOf(splitPath[1]) >= 0
        ? splitPath[1]
        : DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  },
);

export const selectContent = createSelector(
  selectGlobal,
  global => global.content,
);
const selectContentByType = createSelector(
  (state, { contentType }) => contentType,
  selectContent,
  (type, content) => content[type],
);
export const selectContentByKey = createSelector(
  (state, { key }) => key,
  selectLocale,
  selectContentByType,
  (key, locale, content) => content[key] && content[key][locale],
);

export const selectContentReady = createSelector(
  selectGlobal,
  global => global.contentReady,
);
const selectContentReadyByType = createSelector(
  (state, { contentType }) => contentType,
  selectContentReady,
  (type, content) => content[type],
);
export const selectContentReadyByKey = createSelector(
  (state, { contentType }) => contentType,
  selectLocale,
  selectContentReadyByType,
  (key, locale, content) => content[key] && content[key][locale],
);

export const selectContentRequested = createSelector(
  selectGlobal,
  global => global.contentRequested,
);
const selectContentRequestedByType = createSelector(
  (state, { contentType }) => contentType,
  selectContentRequested,
  (type, content) => content[type],
);
export const selectContentRequestedByKey = createSelector(
  (state, { key }) => key,
  selectLocale,
  selectContentRequestedByType,
  (key, locale, content) => content[key] && content[key][locale],
);
export const selectConfig = createSelector(
  selectGlobal,
  global => global.config,
);
export const selectConfigByKey = createSelector(
  (state, { key }) => key,
  selectConfig,
  (key, config) => config[key],
);
export const selectLayersConfig = createSelector(
  selectConfig,
  config => config.layers,
);
export const selectExploreConfig = createSelector(
  selectConfig,
  config => config.explore,
);
export const selectStoriesConfig = createSelector(
  selectConfig,
  config => config.stories,
);
export const selectSingleLayerConfig = createSelector(
  (state, { key }) => key,
  selectLayersConfig,
  (key, layers) => layers && layers.find(l => l.id === key),
);
export const selectSingleLayerContentConfig = createSelector(
  (state, { key }) => key,
  selectLayersConfig,
  (key, layers) => {
    if (!layers) return null;
    const layerConfig = layers.find(l => l.id === key);
    if (!layerConfig) return null;
    if (layerConfig['content-default']) {
      const layerConfigDefault = layers.find(
        l => l.id === layerConfig['content-default'],
      );
      if (layerConfigDefault) return layerConfigDefault;
    }
    return layerConfig;
  },
);
export const selectSingleLayerCategory = createSelector(
  selectSingleLayerConfig,
  selectExploreConfig,
  (layer, explore) => {
    if (!layer || !explore) return null;
    return explore.find(cat => cat.id === layer.category);
  },
);
export const selectSingleLayerGroup = createSelector(
  selectSingleLayerConfig,
  selectSingleLayerCategory,
  (layer, exploreCategory) => {
    if (!layer || !exploreCategory) return null;
    return (
      exploreCategory.groups &&
      exploreCategory.groups.find(g => g.id === layer.group)
    );
  },
);

export const selectConfigReady = createSelector(
  selectGlobal,
  global => global.configReady,
);
export const selectConfigReadyByKey = createSelector(
  (state, { contentType }) => contentType,
  selectConfigReady,
  (key, config) => config[key],
);

export const selectConfigRequested = createSelector(
  selectGlobal,
  global => global.configReady,
);
export const selectConfigRequestedByKey = createSelector(
  (state, { key }) => key,
  selectConfigRequested,
  (key, config) => config[key],
);

export const selectSingleProjectConfig = createSelector(
  (state, { key }) => key,
  state => selectConfigByKey(state, { key: 'projects' }),
  (key, projects) => {
    const pid = startsWith(key, `${PROJECT_CONFIG.id}-`)
      ? key.replace(`${PROJECT_CONFIG.id}-`, '')
      : key;
    return projects && projects.find(p => p.project_id === pid);
  },
);

export const selectUIState = createSelector(
  selectGlobal,
  global => global.uiState,
);
export const selectUIStateByKey = createSelector(
  (state, { key }) => key,
  selectUIState,
  (key, uiState) => uiState[key],
);
export const selectUIURL = createSelector(
  selectRouterSearchParams,
  (key, search) => (search.has('ui') ? search.get('ui') : null),
);
export const selectUIURLByKey = createSelector(
  (state, { key }) => key,
  selectRouterSearchParams,
  (key, search) => {
    if (search.has(`ui-${key}`)) {
      const paramValues = search.get(`ui-${key}`).split(URL_SEARCH_SEPARATOR);
      return paramValues.reduce((memo, pv) => {
        if (pv.indexOf(':') === -1) return memo;
        const pvsplit = pv.split(':');
        let val = pvsplit[1];
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        if (isNumber(val))
          val = val.indexOf('.') ? parseFloat(val, 10) : parseInt(val, 10);
        return {
          ...memo,
          [pvsplit[0]]: val,
        };
      }, {});
    }
    return null;
  },
);

export const selectActiveLayers = createSelector(
  selectLayersSearch,
  layersSearch =>
    layersSearch === '' ? [] : layersSearch.split(URL_SEARCH_SEPARATOR),
);
export const selectIsActiveLayer = createSelector(
  (state, id) => id,
  selectActiveLayers,
  (id, activeLayers) => activeLayers.indexOf(id) > -1,
);

export const selectFirstLanding = createSelector(
  selectGlobal,
  global => !global.landing,
);
export const selectLayerInfoVisible = createSelector(
  selectRouterSearchParams,
  search => {
    if (search.has('ui-info')) {
      return search.get('ui-info') === '1';
    }
    return true;
  },
);

export const selectShowKey = createSelector(
  selectGlobal,
  global => global.showKey,
);
