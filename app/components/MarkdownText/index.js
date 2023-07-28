import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-remarkable';
import { Text } from 'grommet';
import { injectIntl, intlShape } from 'react-intl';
import { formatMessageForValues } from 'utils/string';

export function MarkdownText({ intl, format, formatValues, content, ...p }) {
  let source = content;
  if (format) {
    source = formatMessageForValues({
      intl,
      message: content,
      values: formatValues,
    });
  }
  return (
    <div className="mpx-markdown-text">
      <Text {...p}>
        <Markdown source={source} />
      </Text>
    </div>
  );
}

MarkdownText.propTypes = {
  content: PropTypes.string,
  format: PropTypes.bool,
  formatValues: PropTypes.object,
  intl: intlShape,
};

export default injectIntl(MarkdownText);
