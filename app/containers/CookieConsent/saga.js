import { takeEvery, takeLatest, put } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import {
  CHECK_COOKIECONSENT,
  COOKIECONSENT_NAME,
  SET_COOKIECONSENT,
  // COOKIECONSENT_CHECKED,
} from './constants';

import { cookieConsentChecked, checkCookieConsent } from './actions';

function* checkCookieConsentSaga() {
  const consentStatus = Cookies.get(COOKIECONSENT_NAME);
  // console.log('Checking for cookie consent. Current status: ', consentStatus);
  yield put(cookieConsentChecked(consentStatus));
}
function* setCookieConsentSaga({ status }) {
  Cookies.set(COOKIECONSENT_NAME, status, { expires: 365, sameSite: 'strict' });
  // console.log('Setting cookie consent status: ', status);
  yield put(checkCookieConsent());
}

export default function* defaultSaga() {
  yield takeLatest(SET_COOKIECONSENT, setCookieConsentSaga);
  yield takeEvery(CHECK_COOKIECONSENT, checkCookieConsentSaga);
}
