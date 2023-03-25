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

export function* loadDataSaga({ key, config, args }) {
  const { type, path, properties } = config;
  let { file } = config;
  const hasMask = args && args.mask;
  if (hasMask) {
    file = config.mask;
  }
  console.log('loadDataSaga({ key, config, args })', key, args, config)
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
              if (!hasMask) {
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
              }
              yield put(setLayerLoadSuccess(key, config, json, Date.now()));
            } else {
              yield put(setLayerRequested(key, false));
              throw new Error(response.statusText);
            }
          }
          if (typeof response.text === 'function' && type === 'csv') {
            const text = yield response.text();
            // console.log('text', text)
            if (text) {
              if (config.geometries) {
                const features = Papa.parse(text, {
                  header: true,
                  skipEmptyLines: true,
                });
                // console.log('features', features);
                let geometries;
                let geometryMasks;
                let subLayers;
                let joins;
                if (config.geometries.length > 0) {
                  const responses = yield all(
                    config.geometries.map(x =>
                      fetch(`${RESOURCES.DATA}/${x.file}`),
                    ),
                  );
                  geometries = yield all(
                    responses.map(r => {
                      if (r.json) {
                        return r.json();
                      }
                      throw new Error('error csv-geometry');
                    }),
                  );
                  geometries = geometries.map((x, index) => {
                    const xconfig = config.geometries[index];
                    let json = x;
                    if (xconfig.type === 'topojson') {
                      json = topojson.feature(
                        json,
                        Object.values(json.objects)[0],
                      );
                    }
                    return {
                      ...json,
                      config: xconfig,
                    };
                  });
                  const masked = geometries.filter(x => x.config.mask);
                  const maskResponses = yield all(
                    masked.map(x =>
                      fetch(`${RESOURCES.DATA}/${x.config.mask}`),
                    ),
                  );
                  geometryMasks = yield all(
                    maskResponses.map(r => {
                      if (r.json) {
                        return r.json();
                      }
                      throw new Error('error csv-geometry');
                    }),
                  );
                  geometryMasks = geometryMasks.map((x, index) => {
                    const mask = masked[index];
                    let json = x;
                    if (mask.config.type === 'topojson') {
                      json = topojson.feature(
                        json,
                        Object.values(json.objects)[0],
                      );
                    }
                    return {
                      ...json,
                      config: mask.config,
                    };
                  });
                }
                if (config.extend) {
                  const xresponses = yield all(
                    config.extend.map(x =>
                      fetch(`${RESOURCES.DATA}/${x.file}`),
                    ),
                  );
                  let attributes = yield all(
                    xresponses.map(r => {
                      if (r.ok && typeof r.text === 'function') {
                        return r.text();
                      }
                      throw new Error('error csv-geometry');
                    }),
                  );
                  attributes = attributes.map((x, index) => ({
                    json: Papa.parse(x, {
                      header: true,
                      skipEmptyLines: true,
                    }),
                    config: config.extend[index],
                  }));
                  // console.log('attributes', attributes)
                  const attributesJoin = attributes.filter(
                    x => x.config && x.config['via-join'],
                  );
                  // console.log('attributesJoin', attributesJoin)
                  const joinresponses = yield all(
                    attributesJoin.map(x =>
                      fetch(`${RESOURCES.DATA}/${x.config['via-join'].file}`),
                    ),
                  );
                  joins = yield all(
                    joinresponses.map(r => {
                      if (r.ok && typeof r.text === 'function') {
                        return r.text();
                      }
                      throw new Error('error csv-geometry');
                    }),
                  );
                  // console.log('joins', joins);

                  joins = joins.map((x, index) => ({
                    json: Papa.parse(x, {
                      header: true,
                      skipEmptyLines: true,
                    }),
                    attributes: attributesJoin[index],
                  }));
                  // console.log('joins 2', joins);
                  // features.data = features.data.map(f => {
                  //
                  //   return {
                  //     ...f
                  //   }
                  // })
                }
                if (
                  config['sub-layers'] &&
                  config['sub-layers'].file &&
                  config['sub-layers'].type === 'csv'
                ) {
                  const slresponse = yield fetch(
                    `${RESOURCES.DATA}/${config['sub-layers'].file}`,
                  );
                  const sltext = yield slresponse.text();
                  if (sltext) {
                    subLayers = Papa.parse(sltext, {
                      header: true,
                      skipEmptyLines: true,
                    });
                  }
                }
                const json = {
                  features,
                  geometries,
                  geometryMasks,
                  subLayers,
                  joins,
                };
                // console.log('json', json)
                yield put(setLayerLoadSuccess(key, config, json, Date.now()));
              } else {
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
                // console.log(json)
                json = setFeatureIds(json);
                yield put(setLayerLoadSuccess(key, config, json, Date.now()));
              }
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
