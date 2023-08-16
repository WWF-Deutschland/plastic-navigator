import { toLower, deburr } from 'lodash/string';
import { defineMessages } from 'react-intl';
/* eslint-disable no-useless-escape */
const INVALID = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]+/g;

const sanitise = str => lowerCase(deburr(str)).replace(INVALID, '');

export const lowerCase = str => toLower(str);

export const upperCaseFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

export const truncateText = (text, limit = 6, keepWords = true) => {
  if (text.length > limit) {
    if (!keepWords) {
      return `${text.substring(0, limit)}\u2026`;
    }
    const words = text.split(' ');
    let truncated = '';
    while (truncated.length <= limit) {
      const word = words.shift();
      truncated = truncated.length > 0 ? `${truncated} ${word}` : word;
    }
    // check if really truncated (not a given as we accept full words)
    return text.length > truncated.length ? `${truncated}\u2026` : text;
  }
  return text;
};

export const startsWith = (str, searchString) =>
  str.substr(0, searchString.length) === searchString;

const VOWEL_REGEX =
  '^[aieouAIEOUàèìòùÀÈÌÒÙáéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕäëïöüÄËÏÖÜ].*';

export const startsWithVowel = str => !!str.match(VOWEL_REGEX);

export const injectMarkdownParagraph = str =>
  str
    .split(' __ ')
    .map(i => i.trim())
    .join('\n\n ');

export const prepMarkdown = (str, { para }) => {
  let res = str;
  if (para) {
    res = injectMarkdownParagraph(res);
  }
  return res;
};

export const sortLabels = (a, b) =>
  deburr(lowerCase(a)) > deburr(lowerCase(b)) ? 1 : -1;

export const cleanupSearchTarget = str => lowerCase(deburr(str));

// match multiple words, incl substrings
export const regExMultipleWords = str => {
  const chunks = sanitise(str).split(' ');
  return chunks
    ? chunks.reduce((words, s) => `${words}(?=.*${s})`, '')
    : sanitise(str);
};

export const formatMessageForValues = ({ intl, message, values }) => {
  if (!values) return message;
  const messages = defineMessages({
    msg: {
      id: 'utils.formatMessage',
      defaultMessage: message,
    },
  });
  return intl.formatMessage(messages.msg, values);
};
