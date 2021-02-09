/*
 * AppReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import {
  COOKIECONSENT_CHECKED,
  SET_COOKIECONSENT,
  SHOW_COOKIECONSENT,
} from './constants';

// The initial state of the App
export const initialState = {
  cookieConsent: null,
  cookieConsentApp: null,
  cookieConsentChecked: false,
  showCookieConsent: null,
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case COOKIECONSENT_CHECKED:
        // console.log(
        //   'Store: storing cookie consent status from cookie: ',
        //   action.status,
        // );
        draft.cookieConsent = action.status;
        draft.cookieConsentChecked = true;
        break;
      case SET_COOKIECONSENT:
        // console.log(
        //   'Store: storing cookie consent status from dialogue ',
        //   action.status,
        // );
        draft.cookieConsentApp = action.status;
        draft.showCookieConsent = false;
        break;
      case SHOW_COOKIECONSENT:
        // console.log(
        //   'Store: storing cookie consent show status from footer ',
        //   action.show,
        // );
        draft.showCookieConsent = action.show;
        break;
    }
  });

export default appReducer;
