/*
 *
 * PanelTransfers actions
 *
 */

import {
  LOAD_DATA,
  DATA_REQUESTED,
  DATA_LOAD_SUCCESS,
  DATA_LOAD_ERROR,
  DATA_READY,
  SET_ANALYSIS,
  SET_DIRECTION,
  SET_NODE,
} from './constants';

export function loadData(key, path) {
  return {
    type: LOAD_DATA,
    key,
    path,
  };
}

export function setDataLoadSuccess(key, data, time) {
  return {
    type: DATA_LOAD_SUCCESS,
    key,
    data,
    time,
  };
}

export function setDataRequested(key, time) {
  return {
    type: DATA_REQUESTED,
    key,
    time,
  };
}

export function setDataLoadError(error, key) {
  return {
    type: DATA_LOAD_ERROR,
    error,
    key,
  };
}

export function setDataReady(key, time) {
  return {
    type: DATA_READY,
    key,
    time,
  };
}
export function setAnalysis(id) {
  return {
    type: SET_ANALYSIS,
    id,
  };
}
export function setDirection(direction) {
  return {
    type: SET_DIRECTION,
    direction,
  };
}
export function setNode(node) {
  return {
    type: SET_NODE,
    node,
  };
}
