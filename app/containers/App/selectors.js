/**
 * The global state selectors
 */
import { createSelector } from 'reselect';
import { DEFAULT_LOCALE, appLocales } from 'i18n';

import { initialState } from './reducer';

const selectGlobal = state => state.global || initialState;

const selectRouter = state => state.router;

export const selectRouterLocation = createSelector(
  selectRouter,
  routerState => routerState.location,
);
export const selectRouterSearchParams = createSelector(
  selectRouterLocation,
  location => location && new URLSearchParams(location.search),
);
export const selectRouterPath = createSelector(
  selectRouterLocation,
  location => location && location.pathname,
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
  global => global.contentReady,
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
