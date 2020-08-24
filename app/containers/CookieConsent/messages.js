/*
 * CC Messages
 *
 * This contains all the text for the CC container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.CookieConsent';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Privacy notice',
  },
  info: {
    id: `${scope}.info`,
    defaultMessage:
      'Where it is essential for the Website to function it may store some of your Personal Data and Cookies.',
  },
  buttonAccept: {
    id: `${scope}.buttonAccept`,
    defaultMessage: 'Agreed',
  },
  linkPrivacyPolicy: {
    id: `${scope}.linkPrivacyPolicy`,
    defaultMessage: 'Our privacy policy',
  },
  linkDialogue: {
    id: `${scope}.linkDialogue`,
    defaultMessage: 'Privacy Settings',
  },
});
