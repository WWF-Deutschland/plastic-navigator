import { toLower, deburr } from 'lodash/string';
import { defineMessages } from 'react-intl';
import { MD_MORELESS_TAG } from 'config';
/* eslint-disable no-useless-escape */
const INVALID = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]+/g;

const sanitiseSearchTarget = str =>
  lowerCase(deburr(str))
    .replace(INVALID, '')
    .replace(MD_MORELESS_TAG, '');

export const sanitiseMarkdown = str => str.replace(MD_MORELESS_TAG, '');

export const lowerCase = str => toLower(str);

export const upperCaseFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

export const truncateText = (text, limit = 6, keepWords = true) => {
  if (text.length > limit) {
    // split at explicit more/less tag
    if (text.indexOf(MD_MORELESS_TAG) > -1) {
      return `${text.split(MD_MORELESS_TAG)[0]} \u2026`;
    }
    // get only first three paragraphs (unless there are no more than 4)
    if (text.indexOf('\n\n') > -1 && text.split('\n\n').length > 5) {
      return `${text
        .split('\n\n')
        .slice(0, 3)
        .join('\n\n')} \u2026`;
    }
    // cut off by character length, ignoring words
    if (!keepWords) {
      return `${text.substring(0, limit)} \u2026`;
    }
    // do not cut within words
    let words = text
      .split('\n\n')
      .map(i => i.trim())
      .join(' \n\n ')
      .split(' ');

    let truncated = '';
    let combo = null;
    let comboBold = null;
    words = words.reduce((memo, w) => {
      let result;
      // do not split headings, combine all words from heading "paragraph"
      // remember in combo const
      if (startsWith(w, '#')) {
        combo = w;
        // add to combo until paragraph ends;
      } else if (combo) {
        combo = `${combo} ${w}`;
        if (endsWith(combo, '\n\n')) {
          result = `${combo}`;
          combo = null;
        }
      }
      // do not split within bold text bits
      else if (startsWith(w, '**') && !endsWith(w, '**')) {
        comboBold = w;
      } else if (comboBold) {
        comboBold = `${comboBold} ${w}`;
        if (endsWith(comboBold, '**')) {
          result = `${comboBold}`;
          comboBold = null;
        }
      } else {
        result = w;
      }
      return result ? [...memo, result] : memo;
    }, []);
    // console.log(words)
    // console.log(words[0])
    while (truncated.length <= limit) {
      const word = words.shift();
      // console.log(word)
      truncated = truncated.length > 0 ? `${truncated} ${word}` : word;
      // console.log(truncated)
    }
    // console.log(truncated)
    // check if really truncated (not a given as we accept full words)
    return text.length > truncated.length ? `${truncated} \u2026` : text;
  }
  return text;
};

export const startsWith = (str, searchString) =>
  str.substr(0, searchString.length) === searchString;

export const endsWith = (str, searchString) => {
  if (str.length < searchString.length) {
    return false;
  }
  return (
    str.substr(str.length - searchString.length, str.length) === searchString
  );
};

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
  const chunks = sanitiseSearchTarget(str).split(' ');
  return chunks
    ? chunks.reduce((words, s) => `${words}(?=.*${s})`, '')
    : sanitiseSearchTarget(str);
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
