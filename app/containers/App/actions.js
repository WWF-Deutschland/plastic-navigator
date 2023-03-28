/*
 * App Actions
 *
 * Actions change things in your application
 * Since this app uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import { ROUTES } from 'config';

import {
  CHANGE_LOCALE,
  NAVIGATE,
  LOAD_CONTENT,
  CONTENT_REQUESTED,
  CONTENT_LOAD_SUCCESS,
  CONTENT_LOAD_ERROR,
  CONTENT_READY,
  LOAD_CONFIG,
  CONFIG_REQUESTED,
  CONFIG_LOAD_SUCCESS,
  CONFIG_LOAD_ERROR,
  CONFIG_READY,
  SET_UI_STATE,
  SET_UI_URL,
  SET_LAYER_INFO,
  SHOW_LAYER_INFO_MODULE,
  TOGGLE_LAYER,
  SET_LAYERS,
  SET_STORY,
  SET_CHAPTER,
  SET_LANDING,
  SET_MAP_POSITION,
  SET_SHOW_KEY,
} from './constants';

export function setLocale(locale) {
  return {
    type: CHANGE_LOCALE,
    locale,
  };
}

/**
 * navigate to new location
 * @param {object || string} location new location { pathname, search } || pathname
 * @param {object} args navigation arguments { replace = true, deleteSearchParams = false}
 * @return {object} `{type: action id, location: new location, args: navigation arguments}`
 */
export function navigate(location, args) {
  return {
    type: NAVIGATE,
    location,
    args,
  };
}
/**
 * proxy action: navigate to new content page
 * @param {object} id new page id
 * @param {object} args navigation arguments { replace = true, deleteSearchParams = null}
 * @return {object} `{type: action id, location: new location, args: navigation arguments}`
 */
export function navigatePage(id, args) {
  return navigate(
    {
      search: { page: id },
    },
    args,
  );
}

// proxy action: navigate home, optionally resetting all search params
export function navigateHome(reset = true) {
  return navigate(
    ROUTES.INTRO,
    reset ? { deleteSearchParams: true, deleteUIState: true } : {},
  );
}

export function loadContent(contentType, key) {
  return {
    type: LOAD_CONTENT,
    key,
    contentType,
  };
}

export function setContentLoadSuccess(contentType, locale, key, data, time) {
  return {
    type: CONTENT_LOAD_SUCCESS,
    data,
    key,
    time,
    contentType,
    locale,
  };
}

export function setContentRequested(contentType, locale, key, time) {
  return {
    type: CONTENT_REQUESTED,
    key,
    time,
    contentType,
    locale,
  };
}

export function setContentLoadError(error, contentType, locale, key) {
  return {
    type: CONTENT_LOAD_ERROR,
    error,
    key,
    contentType,
    locale,
  };
}

export function setContentReady(contentType, key, locale, time) {
  return {
    type: CONTENT_READY,
    key,
    time,
    contentType,
    locale,
  };
}

export function loadConfig(key) {
  return {
    type: LOAD_CONFIG,
    key,
  };
}

export function setConfigLoadSuccess(key, data, time) {
  return {
    type: CONFIG_LOAD_SUCCESS,
    data,
    key,
    time,
  };
}

export function setConfigRequested(key, time) {
  return {
    type: CONFIG_REQUESTED,
    key,
    time,
  };
}

export function setConfigLoadError(error, key) {
  return {
    type: CONFIG_LOAD_ERROR,
    error,
    key,
  };
}

export function setConfigReady(key, time) {
  return {
    type: CONFIG_READY,
    key,
    time,
  };
}

export function setUIState(component, state) {
  return {
    type: SET_UI_STATE,
    component,
    state,
  };
}
export function setUIURL(key, newState) {
  return {
    type: SET_UI_URL,
    key,
    newState,
  };
}
export function setLayerInfo(layer, view, copy) {
  return {
    type: SET_LAYER_INFO,
    layer,
    view,
    copy,
  };
}
export function showLayerInfoModule(visible = true) {
  return {
    type: SHOW_LAYER_INFO_MODULE,
    visible,
  };
}
export function toggleLayer(id) {
  return {
    type: TOGGLE_LAYER,
    id,
  };
}
export function setLayers(layers) {
  return {
    type: SET_LAYERS,
    layers,
  };
}
export function setChapter(index) {
  return {
    type: SET_CHAPTER,
    index,
  };
}
export function setStory(index) {
  return {
    type: SET_STORY,
    index,
  };
}
export function setLanding() {
  return {
    type: SET_LANDING,
  };
}
export function setMapPosition(position) {
  return {
    type: SET_MAP_POSITION,
    position,
  };
}
export function setShowKey(value) {
  return {
    type: SET_SHOW_KEY,
    value,
  };
}
