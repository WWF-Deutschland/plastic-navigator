/*
 * AppReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { PAGES, CONFIG } from 'config';
import { appLocales } from 'i18n';
import {
  CONTENT_REQUESTED,
  CONTENT_LOAD_SUCCESS,
  CONTENT_LOAD_ERROR,
  CONFIG_REQUESTED,
  CONFIG_LOAD_SUCCESS,
  CONFIG_LOAD_ERROR,
  SET_UI_STATE,
  SET_LANDING,
  SET_SHOW_KEY,
} from './constants';

/* eslint-disable no-param-reassign */
const locales = appLocales.reduce((memo, locale) => {
  memo[locale] = null;
  return memo;
}, {});

const initialContent = {
  pages: Object.keys(PAGES).reduce((memo, key) => {
    memo[key] = Object.assign({}, locales);
    return memo;
  }, {}),
  layers: {},
};

const initialConfig = Object.keys(CONFIG).reduce((memo, key) => {
  memo[key] = null;
  return memo;
}, {});

// The initial state of the App
export const initialState = {
  content: Object.assign({}, initialContent),
  // record request time
  contentRequested: Object.assign({}, initialContent),
  // record return time
  contentReady: Object.assign({}, initialContent),
  config: Object.assign({}, initialConfig),
  // record request time
  configRequested: Object.assign({}, initialConfig),
  // record return time
  configReady: Object.assign({}, initialConfig),
  // // record error time
  // contentError: Object.assign({}, initialContent),
  uiState: {},
  landing: false,
  showKey: false,
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CONTENT_REQUESTED:
        if (draft.contentRequested[action.contentType])
          draft.contentRequested[action.contentType][action.key] = {
            [action.locale]: action.time,
          };
        break;
      case CONTENT_LOAD_SUCCESS:
        if (draft.content[action.contentType])
          draft.content[action.contentType][action.key] = {
            [action.locale]: action.data,
          };
        if (draft.contentReady[action.contentType])
          draft.contentReady[action.contentType][action.key] = {
            [action.locale]: action.time,
          };
        break;
      case CONTENT_LOAD_ERROR:
        console.log(
          'Error loading content ... giving up!',
          `${action.contentType}/${action.key}`,
        );
        if (draft.contentRequested[action.contentType])
          draft.contentRequested[action.contentType][action.key] = {
            [action.locale]: action.time,
          };
        break;
      case CONFIG_REQUESTED:
        draft.configRequested[action.key] = action.time;
        break;
      case CONFIG_LOAD_SUCCESS:
        draft.config[action.key] = action.data;
        draft.configReady[action.key] = action.time;
        break;
      case CONFIG_LOAD_ERROR:
        console.log('Error loading config file ... giving up!', action.key);
        draft.configRequested[action.key] = action.time;
        break;
      case SET_UI_STATE:
        if (action.component && action.state) {
          draft.uiState[action.component] = action.state;
        } else {
          draft.uiState = {};
        }
        break;
      case SET_LANDING:
        draft.landing = true;
        break;
      case SET_SHOW_KEY:
        draft.showKey = action.value;
        break;
    }
  });

export default appReducer;
