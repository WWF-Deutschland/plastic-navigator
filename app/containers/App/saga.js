import { takeEvery, takeLatest, select, put, call } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import extend from 'lodash/extend';
import 'whatwg-fetch';
import 'url-search-params-polyfill';

import {
  MAX_LOAD_ATTEMPTS,
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
} from './actions';

/**
 * Generator function. Function for restarting sagas multiple times before giving up and calling the error handler.
 * - following https://codeburst.io/try-again-more-redux-saga-patterns-bfbc3ffcdc
 *
 * @param {function} generator the saga generator to be restarted
 * @param {function} handleError the error handler after X unsuccessful tries
 * @param {integer} maxTries the maximum number of tries
 */
const autoRestart = (generator, handleError, maxTries = MAX_LOAD_ATTEMPTS) =>
  function* autoRestarting(...args) {
    let n = 0;
    while (n < maxTries) {
      n += 1;
      try {
        yield call(generator, ...args);
        break;
      } catch (err) {
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
        }/${currentLocale}/${LAYER_CONTENT_PATH}/${key}`;
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
      const url = `${RESOURCES.DATA}/${CONFIG[key]}`;
      try {
        // First record that we are requesting
        yield put(setConfigRequested(key, Date.now()));
        const response = yield fetch(url);
        const responseOk = yield response.ok;
        if (responseOk && typeof response.json === 'function') {
          const json = yield response.json();
          if (json) {
            yield put(setConfigLoadSuccess(key, json, Date.now()));
          } else {
            yield put(setConfigRequested(key, false));
            throw new Error(response.statusText);
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
  const currentLocale = yield select(selectLocale);
  const currentLocation = yield select(selectRouterLocation);
  // default args
  const myArgs = extend(
    {
      needsLocale: true,
      replaceSearch: false, // if location search should fully replace previous
      deleteSearchParams: null, //  a list of specific search params to remove
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
    if (myArgs.deleteSearchParams && Array.isArray(myArgs.deleteSearchParams)) {
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
  yield put(push(`${path}${search}`));
}

function* changeLocaleSaga({ locale }) {
  const currentLocale = yield select(selectLocale);
  const currentLocation = yield select(selectRouterLocation);
  let path = '/';
  if (currentLocation.pathname) {
    path = currentLocation.pathname.replace(`/${currentLocale}`, `/${locale}`);
  }
  yield put(push(`${path}${currentLocation.search}`));
}

function* setLayerInfoSaga({ id }) {
  const currentLocation = yield select(selectRouterLocation);
  const searchParams = new URLSearchParams(currentLocation.search);
  // only update if not already active
  if (searchParams.get('info') !== id) {
    if (typeof id === 'undefined' || id === '') {
      searchParams.delete('info');
    } else {
      searchParams.set('info', id);
    }
    // convert to string and append if necessary
    const newSearch = searchParams.toString();
    const search = newSearch.length > 0 ? `?${newSearch}` : '';
    yield put(push(`${currentLocation.pathname}${search}`));
  }
}
function* toggleLayerSaga({ id }) {
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
  } else {
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
}

export default function* defaultSaga() {
  // See example in containers/HomePage/saga.js
  yield takeEvery(
    LOAD_CONTENT,
    autoRestart(loadContentSaga, loadContentErrorHandler, MAX_LOAD_ATTEMPTS),
  );
  yield takeEvery(
    LOAD_CONFIG,
    autoRestart(loadConfigSaga, loadConfigErrorHandler, MAX_LOAD_ATTEMPTS),
  );
  yield takeLatest(NAVIGATE, navigateSaga);
  yield takeLatest(CHANGE_LOCALE, changeLocaleSaga);
  yield takeLatest(SET_LAYER_INFO, setLayerInfoSaga);
  yield takeLatest(TOGGLE_LAYER, toggleLayerSaga);
}
