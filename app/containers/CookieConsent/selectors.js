/**
 * The domain state selectors
 */
import { createSelector } from 'reselect';

import { initialState } from './reducer';

/**
 * Direct selector to the consent state domain
 */

const selectDomain = state => state.consent || initialState;

export const selectCookieConsent = createSelector(
  selectDomain,
  domain => domain.cookieConsent,
);
export const selectCookieConsentApp = createSelector(
  selectDomain,
  domain => domain.cookieConsentApp,
);
export const selectCookieConsentChecked = createSelector(
  selectDomain,
  domain => domain.cookieConsentChecked,
);
export const selectCookieConsentShow = createSelector(
  selectDomain,
  domain => domain.showCookieConsent,
);
