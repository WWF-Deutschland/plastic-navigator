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

export const CHECK_COOKIECONSENT = 'app/Consent/CHECK_COOKIECONSENT';
export const COOKIECONSENT_CHECKED = 'app/Consent/COOKIECONSENT_CHECKED';
export const SET_COOKIECONSENT = 'app/Consent/SET_COOKIECONSENT';
export const SHOW_COOKIECONSENT = 'app/Consent/SHOW_COOKIECONSENT';

export const COOKIECONSENT_NAME = 'wwf-global-plastic-navigator-privacy-status';
