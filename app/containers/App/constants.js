/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const NAVIGATE = 'app/App/NAVIGATE';
export const CHANGE_LOCALE = 'app/App/CHANGE_LOCALE';

// loading editorial content
export const LOAD_CONTENT = 'app/App/LOAD_CONTENT';
export const CONTENT_REQUESTED = 'app/App/CONTENT_REQUESTED';
export const CONTENT_LOAD_ERROR = 'app/App/CONTENT_LOAD_ERROR';
export const CONTENT_LOAD_SUCCESS = 'app/App/CONTENT_LOAD_SUCCESS';
export const CONTENT_READY = 'app/App/CONTENT_READY';
// loading dynamic configuration files
export const LOAD_CONFIG = 'app/App/LOAD_CONFIG';
export const CONFIG_REQUESTED = 'app/App/CONFIG_REQUESTED';
export const CONFIG_LOAD_ERROR = 'app/App/CONFIG_LOAD_ERROR';
export const CONFIG_LOAD_SUCCESS = 'app/App/CONFIG_LOAD_SUCCESS';
export const CONFIG_READY = 'app/App/CONFIG_READY';

export const SET_UI_STATE = 'app/App/SET_UI_STATE';
export const SET_UI_URL = 'app/App/SET_UI_URL';
export const SET_LAYER_INFO = 'app/App/SET_LAYER_INFO';
export const SET_ITEM_INFO = 'app/App/SET_ITEM_INFO';
export const SHOW_LAYER_INFO_MODULE = 'app/App/SHOW_LAYER_INFO_MODULE';
export const TOGGLE_LAYER = 'app/App/TOGGLE_LAYER';
export const SET_LAYERS = 'app/App/SET_LAYERS';
export const SET_CHAPTER = 'app/App/SET_CHAPTER';
export const SET_STORY = 'app/App/SET_STORY';
export const SET_LANDING = 'app/App/SET_LANDING';
export const SET_MAP_POSITION = 'app/App/SET_MAP_POSITION';
export const SET_SHOW_KEY = 'app/App/SHOW_KEY';
