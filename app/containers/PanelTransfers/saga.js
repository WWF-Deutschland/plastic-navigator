import { takeEvery, takeLatest, select, put, call } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import Papa from 'papaparse';
import 'whatwg-fetch';
import 'url-search-params-polyfill';

import { MAX_LOAD_ATTEMPTS, RESOURCES } from 'config';
import { selectRouterLocation } from 'containers/App/selectors';
import { LOAD_DATA, SET_ANALYSIS, SET_DIRECTION, SET_NODE } from './constants';

import { selectDataReadyByKey, selectDataRequestedByKey } from './selectors';

import {
  setDataRequested,
  setDataLoadError,
  setDataLoadSuccess,
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
function* loadDataErrorHandler(err, { key }) {
  yield put(setDataLoadError(err, key));
}

export function* loadDataSaga({ key, path }) {
  // requestedSelector returns the times that entities where fetched from the API
  const requestedAt = yield select(selectDataRequestedByKey, key);
  const ready = yield select(selectDataReadyByKey, key);
  // If haven't loaded yet, do so now.
  if (path && key && !requestedAt && !ready) {
    const url = `${RESOURCES.DATA}/${path}`;
    try {
      // First record that we are requesting
      yield put(setDataRequested(key, Date.now()));
      const response = yield fetch(url);
      const responseOk = yield response.ok;
      if (responseOk) {
        if (typeof response.text === 'function') {
          const text = yield response.text();
          if (text) {
            const parsed = yield Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
            });
            yield put(setDataLoadSuccess(key, parsed.data, Date.now()));
          } else {
            yield put(setDataRequested(key, false));
            throw new Error(response.statusText);
          }
        }
      } else {
        yield put(setDataRequested(key, false));
        throw new Error(response.statusText);
      }
    } catch (err) {
      yield put(setDataRequested(key, false));
      // throw error
      throw new Error(err);
    }
  }
}

function* setAnalysisSaga({ id }) {
  const currentLocation = yield select(selectRouterLocation);
  const searchParams = new URLSearchParams(currentLocation.search);

  searchParams.set('transfer', id);

  const newSearch = searchParams.toString();
  const search = newSearch.length > 0 ? `?${newSearch}` : '';
  if (search !== currentLocation.search) {
    yield put(push(`${currentLocation.pathname}${search}`));
  }
}
function* setDirectionSaga({ direction }) {
  const currentLocation = yield select(selectRouterLocation);
  const searchParams = new URLSearchParams(currentLocation.search);

  searchParams.set('dir', direction);

  const newSearch = searchParams.toString();
  const search = newSearch.length > 0 ? `?${newSearch}` : '';
  if (search !== currentLocation.search) {
    yield put(push(`${currentLocation.pathname}${search}`));
  }
}
function* setNodeSaga({ node }) {
  const currentLocation = yield select(selectRouterLocation);
  const searchParams = new URLSearchParams(currentLocation.search);

  if (node && node.trim() !== '') {
    searchParams.set('node', node);
  } else {
    searchParams.delete('node');
  }

  const newSearch = searchParams.toString();
  const search = newSearch.length > 0 ? `?${newSearch}` : '';
  if (search !== currentLocation.search) {
    yield put(push(`${currentLocation.pathname}${search}`));
  }
}

export default function* defaultSaga() {
  yield takeEvery(
    LOAD_DATA,
    autoRestart(loadDataSaga, loadDataErrorHandler, MAX_LOAD_ATTEMPTS),
  );
  yield takeLatest(SET_ANALYSIS, setAnalysisSaga);
  yield takeLatest(SET_DIRECTION, setDirectionSaga);
  yield takeLatest(SET_NODE, setNodeSaga);
}
