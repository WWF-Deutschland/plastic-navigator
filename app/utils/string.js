import { toLower } from 'lodash/string';

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
