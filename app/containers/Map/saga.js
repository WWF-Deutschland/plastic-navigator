import { takeEvery, select, put, call, all } from 'redux-saga/effects';
import * as topojson from 'topojson-client';
import { csv2geojson } from 'csv2geojson';
import Papa from 'papaparse';
import 'whatwg-fetch';
import 'url-search-params-polyfill';

import { MAX_LOAD_ATTEMPTS, RESOURCES } from 'config';

import quasiEquals from 'utils/quasi-equals';
import asArray from 'utils/as-array';

import { LOAD_LAYER } from './constants';

import { selectLayerReadyByKey, selectLayerRequestedByKey } from './selectors';

import {
  setLayerRequested,
  setLayerLoadError,
  setLayerLoadSuccess,
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
  yield put(setLayerLoadError(err, key));
}

function setFeatureIds(json) {
  if (json.features) {
    return {
      ...json,
      features: json.features.map((f, index) => ({
        ...f,
        properties: {
          ...f.properties,
          f_id: `f${index}`,
        },
      })),
    };
  }
  return json;
}
function extendProperties(properties, config, parsed) {
  return properties.map(d =>
    asArray(config.extend).reduce((memo, x, index) => {
      const value = parsed[index + 1].data.find(xdata =>
        quasiEquals(xdata[x.join.self], d[x.join.related]),
      );
      return {
        ...memo,
        [x.join.as]: value,
      };
    }, d),
  );
}
function setProperties(json, config, parsed) {
  const properties = parsed[0].data;
  const features = json.features.reduce((memo, feature) => {
    let joinProperties = properties.filter(p => {
      const fp =
        feature.properties[config.join.relatedPrimary] ||
        feature.properties[config.join.related];
      return quasiEquals(p[config.join.self], fp);
    });
    if (joinProperties.length === 0) {
      if (
        config.featuresWithoutProperties &&
        config.featuresWithoutProperties === 'true'
      ) {
        if (config.join.default) {
          joinProperties = asArray(config.join.default);
          const newProperties = config.extend
            ? extendProperties(joinProperties, config, parsed)
            : joinProperties;

          return [
            ...memo,
            {
              ...feature,
              properties: {
                ...feature.properties,
                [config.join.as]: newProperties,
              },
            },
          ];
        }
        return [...memo, feature];
      }
      return memo;
    }
    // console.log(feature.properties, joinProperties)
    // return [...memo, feature];
    return [
      ...memo,
      {
        ...feature,
        properties: {
          ...feature.properties,
          [config.join.as]: config.extend
            ? extendProperties(joinProperties, config, parsed)
            : joinProperties,
        },
      },
    ];
  }, []);
  return {
    ...json,
    features,
  };
}

export function* loadDataSaga({ key, config }) {
  const { type, path, file, properties } = config;
  if (type && (type === 'geojson' || type === 'topojson' || type === 'csv')) {
    // requestedSelector returns the times that entities where fetched from the API
    const requestedAt = yield select(selectLayerRequestedByKey, key);
    const ready = yield select(selectLayerReadyByKey, key);
    // If haven't loaded yet, do so now.
    if (!requestedAt && !ready) {
      const url = `${RESOURCES.DATA}/${path || file}`;
      try {
        // First record that we are requesting
        yield put(setLayerRequested(key, Date.now()));
        const response = yield fetch(url);
        const responseOk = yield response.ok;
        if (responseOk) {
          if (
            typeof response.json === 'function' &&
            (type === 'geojson' || type === 'topojson')
          ) {
            let json = yield response.json();
            if (json) {
              if (type === 'topojson') {
                json = yield topojson.feature(
                  json,
                  Object.values(json.objects)[0],
                );
              }
              json = setFeatureIds(json);
              if (
                properties &&
                properties.file &&
                properties.join &&
                properties.type === 'csv'
              ) {
                const propertyUrls = [properties.file];
                if (properties.extend) {
                  asArray(properties.extend).forEach(x => {
                    if (x.type === 'csv') propertyUrls.push(x.file);
                  });
                }
                const responses = yield all(
                  propertyUrls.map(x => fetch(`${RESOURCES.DATA}/${x}`)),
                );
                const texts = yield all(
                  responses.map(r => {
                    if (r.ok && typeof r.text === 'function') {
                      return r.text();
                    }
                    throw new Error(r.statusText);
                  }),
                );
                const parsed = texts.map(t =>
                  Papa.parse(t, {
                    header: true,
                    skipEmptyLines: true,
                  }),
                );
                json = setProperties(json, properties, parsed);
              }
              yield put(setLayerLoadSuccess(key, config, json, Date.now()));
            } else {
              yield put(setLayerRequested(key, false));
              throw new Error(response.statusText);
            }
          }
          if (typeof response.text === 'function' && type === 'csv') {
            const text = yield response.text();
            if (text) {
              const promise = new Promise(resolve => {
                csv2geojson(
                  text,
                  {
                    latfield: 'latitude',
                    lonfield: 'longitude',
                    delimiter: ',',
                  },
                  (err, data) => {
                    resolve(data);
                  },
                );
              });
              let json = yield promise;
              json = setFeatureIds(json);
              yield put(setLayerLoadSuccess(key, config, json, Date.now()));
            }
          }
        } else {
          yield put(setLayerRequested(key, false));
          throw new Error(response.statusText);
        }
      } catch (err) {
        yield put(setLayerRequested(key, false));
        // throw error
        throw new Error(err);
      }
    }
  }
}

export default function* defaultSaga() {
  yield takeEvery(
    LOAD_LAYER,
    autoRestart(loadDataSaga, loadDataErrorHandler, MAX_LOAD_ATTEMPTS),
  );
}
