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

import {
  CHECK_COOKIECONSENT,
  COOKIECONSENT_CHECKED,
  SET_COOKIECONSENT,
  SHOW_COOKIECONSENT,
} from './constants';

export function checkCookieConsent() {
  return {
    type: CHECK_COOKIECONSENT,
  };
}
export function setCookieConsent(status) {
  return {
    type: SET_COOKIECONSENT,
    status,
  };
}
export function cookieConsentChecked(status) {
  return {
    type: COOKIECONSENT_CHECKED,
    status,
  };
}
export function showCookieConsent(show) {
  return {
    type: SHOW_COOKIECONSENT,
    show,
  };
}
