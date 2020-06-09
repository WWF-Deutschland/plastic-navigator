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

export const LOAD_CONTENT = 'rle/App/LOAD_CONTENT';
export const CONTENT_REQUESTED = 'rle/App/CONTENT_REQUESTED';
export const CONTENT_LOAD_ERROR = 'rle/App/CONTENT_LOAD_ERROR';
export const CONTENT_LOAD_SUCCESS = 'rle/App/CONTENT_LOAD_SUCCESS';
export const CONTENT_READY = 'rle/App/CONTENT_READY';
