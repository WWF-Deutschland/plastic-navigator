import { takeEvery, select, put, call, delay } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import extend from 'lodash/extend';
import Papa from 'papaparse';
import 'whatwg-fetch';
import 'url-search-params-polyfill';

import {
  MAX_LOAD_ATTEMPTS,
  MAX_NAV_ATTEMPTS,
  RETRY_LOAD_DELAY,
  RETRY_NAV_DELAY,
  RESOURCES,
  PAGES,
  CONFIG,
  URL_SEARCH_SEPARATOR,
  LAYER_CONTENT_PATH,
} from 'config';

import {
  LOAD_CONTENT,
  NAVIGATE,
  CHANGE_LOCALE,
  LOAD_CONFIG,
  SET_LAYER_INFO,
  TOGGLE_LAYER,
  SET_LAYERS,
  SET_STORY,
  SET_CHAPTER,
  SET_MAP_POSITION,
  SET_UI_URL,
  SHOW_LAYER_INFO_MODULE,
} from './constants';

import {
  selectLocale,
  selectRouterLocation,
  selectContentReadyByKey,
  selectContentRequestedByKey,
  selectConfigReadyByKey,
  selectConfigRequestedByKey,
} from './selectors';

import {
  setContentRequested,
  setContentLoadError,
  setContentLoadSuccess,
  setConfigRequested,
  setConfigLoadError,
  setConfigLoadSuccess,
  setUIState,
} from './actions';

let navPending = false; // false: pass; true: wait

/**
 * Generator function. Function for restarting sagas multiple times before giving up and calling the error handler.
 * - following https://codeburst.io/try-again-more-redux-saga-patterns-bfbc3ffcdc
 *
 * @param {function} generator the saga generator to be restarted
 * @param {function} handleError the error handler after X unsuccessful tries
 * @param {integer} maxTries the maximum number of tries
 */
const autoRestart = (
  generator,
  handleError,
  maxTries = MAX_LOAD_ATTEMPTS,
  delayMS = RETRY_LOAD_DELAY,
) =>
  function* autoRestarting(...args) {
    let n = 0;
    while (n < maxTries) {
      try {
        yield call(generator, ...args);
        break;
      } catch (err) {
        yield delay(delayMS);
        yield (n += 1);
        if (n >= maxTries) {
          yield handleError(err, ...args);
        }
      }
    }
  };

/**
 * Generator function. Load data error handler:
 * - Record load error
 *
 * @param {object} payload {key: data set key}
 */
function* loadContentErrorHandler(err, { key, contentType, locale }) {
  yield put(setContentLoadError(err, contentType, locale, key));
}
function* loadConfigErrorHandler(err, { key }) {
  yield put(setConfigLoadError(err, key));
}
function* navigateErrorHandler(err) {
  console.log('Failed to navigate... giving up!', err);
  navPending = false;
}

// key expected to include full path, for at risk data metric/country
function* loadContentSaga({ key, contentType }) {
  if (contentType === 'layers' || PAGES[key]) {
    const requestedAt = yield select(selectContentRequestedByKey, {
      contentType,
      key,
    });
    const ready = yield select(selectContentReadyByKey, {
      contentType,
      key,
    });
    // If haven't loaded yet, do so now.
    if (!requestedAt && !ready) {
      const currentLocale = yield select(selectLocale);
      let url;
      if (contentType === 'pages') {
        const page = PAGES[key];
        url = `${RESOURCES.CONTENT}/${currentLocale}/${page.path}/`;
      }
      if (contentType === 'layers') {
        url = `${
          RESOURCES.CONTENT
        }/${currentLocale}/${LAYER_CONTENT_PATH}/${key}/`;
      }
      if (url) {
        try {
          // First record that we are requesting
          yield put(
            setContentRequested(contentType, currentLocale, key, Date.now()),
          );
          const response = yield fetch(url);
          const responseOk = yield response.ok;
          if (responseOk && typeof response.text === 'function') {
            const responseBody = yield response.text();
            if (responseBody) {
              yield put(
                setContentLoadSuccess(
                  contentType,
                  currentLocale,
                  key,
                  responseBody,
                  Date.now(),
                ),
              );
            } else {
              yield put(
                setContentRequested(contentType, currentLocale, key, false),
              );
              throw new Error(response.statusText);
            }
          } else {
            yield put(
              setContentRequested(contentType, currentLocale, key, false),
            );
            throw new Error(response.statusText);
          }
        } catch (err) {
          // throw error
          yield put(
            setContentRequested(contentType, currentLocale, key, false),
          );
          throw new Error(err);
        }
      }
    }
  }
}
function* loadConfigSaga({ key }) {
  if (CONFIG[key]) {
    const requestedAt = yield select(selectConfigRequestedByKey, {
      key,
    });
    const ready = yield select(selectConfigReadyByKey, {
      key,
    });
    // If haven't loaded yet, do so now.
    if (!requestedAt && !ready) {
      const config = CONFIG[key];
      const url = `${RESOURCES.DATA}/${
        typeof config === 'string' ? config : config.file
      }`;
      try {
        // First record that we are requesting
        yield put(setConfigRequested(key, Date.now()));
        const response = yield fetch(url);
        const responseOk = yield response.ok;
        const type = config.type || 'json';
        if (responseOk) {
          if (type === 'json' && typeof response.json === 'function') {
            const json = yield response.json();
            if (json) {
              yield put(setConfigLoadSuccess(key, json, Date.now()));
            } else {
              yield put(setConfigRequested(key, false));
              throw new Error(response.statusText);
            }
          }
          if (type === 'csv' && typeof response.text === 'function') {
            const text = yield response.text();
            // console.log(csv)
            if (text) {
              const parsed = yield Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
              });
              yield put(setConfigLoadSuccess(key, parsed.data, Date.now()));
            } else {
              yield put(setConfigRequested(key, false));
              throw new Error(response.statusText);
            }
          }
        } else {
          yield put(setConfigRequested(key, false));
          throw new Error(response.statusText);
        }
      } catch (err) {
        yield put(setConfigRequested(key, false));
        // throw error
        throw new Error(err);
      }
    }
  }
}

// location can either be string or object { pathname, search }
function* navigateSaga({ location, args }) {
  if (navPending) {
    console.log('navigateSaga waiting for: ', navPending);
    throw new Error({
      function: 'navigateSaga',
    });
  } else {
    navPending = 'navigateSaga';
    const currentLocale = yield select(selectLocale);
    const currentLocation = yield select(selectRouterLocation);
    // default args
    const myArgs = extend(
      {
        needsLocale: true,
        replaceSearch: false, // if location search should fully replace previous
        deleteSearchParams: null, //  a list of specific search params to remove
        deleteUIState: false, //  a list of specific search params to remove
      },
      args || {},
    );

    // 1. figure out path ========================
    // the new pathname
    let path = '';
    let newPathname = '';

    // if location is string
    // use as pathname and keep old search
    // note: location path is expected not to contain the locale
    if (typeof location === 'string') {
      newPathname += location;
      path = myArgs.needsLocale
        ? `/${currentLocale}/${newPathname}${newPathname === '' ? '' : '/'}`
        : newPathname;
    }

    // if location is object, use pathname and replace or extend search
    // location path is expected not to contain the locale
    else if (
      location &&
      typeof location === 'object' &&
      typeof location.pathname !== 'undefined'
    ) {
      newPathname += location.pathname;
      path = myArgs.needsLocale
        ? `/${currentLocale}/${newPathname}${newPathname === '' ? '' : '/'}`
        : newPathname;
    }

    // keep old pathname
    else {
      path = currentLocation.pathname;
    }

    // 2. figure out new search params =================================
    let newSearchParams;
    // fully replace previous search
    if (
      location &&
      typeof location === 'object' &&
      typeof location.search !== 'undefined' &&
      myArgs.replaceSearch
    ) {
      newSearchParams = new URLSearchParams(location.search);
    }
    // remove all search params
    else if (
      myArgs.deleteSearchParams &&
      !Array.isArray(myArgs.deleteSearchParams)
    ) {
      newSearchParams = new URLSearchParams('');
    }
    // keep or modify current search
    else {
      const currentSearchParams = new URLSearchParams(currentLocation.search);

      // remove some specific search params
      if (
        myArgs.deleteSearchParams &&
        Array.isArray(myArgs.deleteSearchParams)
      ) {
        newSearchParams = myArgs.deleteSearchParams.reduce(
          (updatedParams, param) => {
            // delete only specific value when key & value are present
            if (param.key) {
              if (param.value) {
                const params = new URLSearchParams();
                updatedParams.forEach((value, key) => {
                  // only keep those that are not deleted
                  if (param.key !== key || param.value !== value) {
                    params.append(key, value);
                  }
                });
                return params;
              }
              updatedParams.delete(param.key);
            } else {
              updatedParams.delete(param);
            }
            return updatedParams;
          },
          currentSearchParams,
        );
      }
      // keep old params (for now)
      else {
        newSearchParams = currentSearchParams;
      }

      // merge params
      if (
        location &&
        typeof location === 'object' &&
        typeof location.search !== 'undefined' &&
        !myArgs.replaceSearch
      ) {
        // adding new params to previous params
        const searchParams = new URLSearchParams(location.search);
        searchParams.forEach((value, key) => newSearchParams.set(key, value));
      }
    }
    // convert to string and append if necessary
    const newSearch = newSearchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    // finally combine new path and search  ============================
    if (
      search !== currentLocation.search ||
      path !== currentLocation.pathname
    ) {
      yield put(push(`${path}${search}`));
    }
    if (myArgs.deleteUIState) {
      yield put(setUIState());
    }
    yield (navPending = false);
  }
}

function* changeLocaleSaga({ locale }) {
  if (navPending) {
    console.log('changeLocaleSaga waiting for', navPending, locale);
    throw new Error({
      function: 'changeLocaleSaga',
    });
  } else {
    navPending = 'changeLocaleSaga';
    const currentLocale = yield select(selectLocale);
    if (currentLocale !== locale) {
      const currentLocation = yield select(selectRouterLocation);
      let path = '/';
      if (currentLocation.pathname) {
        path = currentLocation.pathname.replace(
          `/${currentLocale}`,
          `/${locale}`,
        );
      }
      yield put(push(`${path}${currentLocation.search}`));
    }
    yield (navPending = false);
  }
}

function* setLayerInfoSaga({ layer, view, copy }) {
  if (navPending) {
    console.log('setLayerInfoSaga waiting for', navPending, view);
    throw new Error({
      function: 'setLayerInfoSaga',
    });
  } else {
    navPending = 'setLayerInfoSaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);
    // only update if not already active
    let infoId = layer;
    if (view) {
      infoId = `${layer}|${view}`;
      if (copy) {
        console.log('COPY INFO', layer, view, copy);
        infoId = `${layer}|${view}|${copy}`;
      }
    }
    if (searchParams.get('info') !== infoId) {
      if (typeof layer === 'undefined' || layer === '') {
        searchParams.delete('info');
      } else {
        searchParams.set('info', infoId);
      }
      // convert to string and append if necessary
      const newSearch = searchParams.toString();
      const search = newSearch.length > 0 ? `?${newSearch}` : '';
      if (search !== currentLocation.search) {
        yield put(push(`${currentLocation.pathname}${search}`));
      }
    }
    yield (navPending = false);
  }
}

function* setLayersSaga({ layers }) {
  if (navPending) {
    console.log('setLayersSaga waiting for: ', navPending);
    throw new Error({
      function: 'setLayersSaga',
    });
  } else {
    navPending = 'setLayersSaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);
    searchParams.delete('layers');

    if (layers && layers.length > 0) {
      searchParams.set('layers', layers.join(URL_SEARCH_SEPARATOR));
    }
    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}

function* setStorySaga({ index }) {
  if (navPending) {
    console.log('setStorySaga waiting for: ', navPending);
    throw new Error({
      function: 'setStorySaga',
    });
  } else {
    navPending = 'setStorySaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);

    searchParams.set('st', index);

    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}

function* toggleLayerSaga({ id }) {
  if (navPending) {
    console.log('toggleLayerSaga waiting for: ', navPending);
    throw new Error({
      function: 'toggleLayerSaga',
    });
  } else {
    navPending = 'toggleLayerSaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);

    const activeLayersParams = searchParams.get('layers');
    const activeLayers = activeLayersParams
      ? activeLayersParams.split(URL_SEARCH_SEPARATOR)
      : [];
    let newLayers = [];
    // remove if already present
    if (activeLayers.indexOf(id) > -1) {
      newLayers = activeLayers.reduce((memo, layer) => {
        if (layer !== id) return [...memo, layer];
        return memo;
      }, []);
    }
    // else add
    else {
      newLayers = [...activeLayers, id];
    }
    if (newLayers.length > 0) {
      searchParams.set('layers', newLayers.join(URL_SEARCH_SEPARATOR));
    } else {
      searchParams.delete('layers');
    }
    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    yield put(push(`${currentLocation.pathname}${search}`));
    yield (navPending = false);
  }
}

function* setChapterSaga({ index }) {
  if (navPending) {
    console.log('setChapterSaga waiting for: ', navPending);
    throw new Error({
      function: 'setChapterSaga',
    });
  } else {
    navPending = 'setChapterSaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);

    searchParams.set('ch', index);

    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}

function* setMapPositionSaga({ position }) {
  if (navPending) {
    console.log('setMapPositionSaga waiting for', navPending);
    throw new Error({
      function: 'setMapPositionSaga',
    });
  } else {
    navPending = 'setMapPositionSaga';
    const currentLocation = yield select(selectRouterLocation);
    const searchParams = new URLSearchParams(currentLocation.search);
    searchParams.set('mview', position);
    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}
function* setUISaga({ key, newState }) {
  if (navPending) {
    console.log('setUISaga waiting for', navPending);
    throw new Error({
      function: 'setUISaga',
    });
  } else if (key && newState) {
    navPending = 'setUISaga';
    const currentLocation = yield select(selectRouterLocation);
    const currentSearchParams = new URLSearchParams(currentLocation.search);
    // const searchString = newSearchParams.toString();
    const newSearch = Object.keys(newState).reduce((m, k) => {
      const state = `${k}:${newState[k]}`;
      if (m === '') return state;
      return `${m}${URL_SEARCH_SEPARATOR}${state}`;
    }, '');
    currentSearchParams.set(`ui-${key}`, newSearch);
    const updatedSearchString = currentSearchParams.toString();
    const search =
      updatedSearchString.length > 0 ? `?${updatedSearchString}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}
function* showLayerInfoSaga({ visible }) {
  if (navPending) {
    console.log('showLayerInfoSaga waiting for', navPending);
    throw new Error({
      function: 'showLayerInfoSaga',
    });
  } else {
    navPending = 'showLayerInfoSaga';
    const currentLocation = yield select(selectRouterLocation);
    const currentSearchParams = new URLSearchParams(currentLocation.search);
    // const searchString = newSearchParams.toString();
    currentSearchParams.set('ui-info', visible ? '1' : '0');
    const updatedSearchString = currentSearchParams.toString();
    const search =
      updatedSearchString.length > 0 ? `?${updatedSearchString}` : '';
    if (search !== currentLocation.search) {
      yield put(push(`${currentLocation.pathname}${search}`));
    }
    yield (navPending = false);
  }
}

export default function* defaultSaga() {
  // See example in containers/HomePage/saga.js
  yield takeEvery(
    LOAD_CONTENT,
    autoRestart(loadContentSaga, loadContentErrorHandler),
  );
  yield takeEvery(
    LOAD_CONFIG,
    autoRestart(loadConfigSaga, loadConfigErrorHandler),
  );
  yield takeEvery(
    NAVIGATE,
    autoRestart(
      navigateSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    CHANGE_LOCALE,
    autoRestart(
      changeLocaleSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    TOGGLE_LAYER,
    autoRestart(
      toggleLayerSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_LAYERS,
    autoRestart(
      setLayersSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_LAYER_INFO,
    autoRestart(
      setLayerInfoSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_STORY,
    autoRestart(
      setStorySaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_CHAPTER,
    autoRestart(
      setChapterSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_MAP_POSITION,
    autoRestart(
      setMapPositionSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SET_UI_URL,
    autoRestart(
      setUISaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
  yield takeEvery(
    SHOW_LAYER_INFO_MODULE,
    autoRestart(
      showLayerInfoSaga,
      navigateErrorHandler,
      MAX_NAV_ATTEMPTS,
      RETRY_NAV_DELAY,
    ),
  );
}
