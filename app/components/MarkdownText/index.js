import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-remarkable';
import { Text } from 'grommet';

export function MarkdownText({ content, ...p }) {
  return (
    <div className="mpx-markdown-text">
      <Text {...p}>
        <Markdown source={content} />
      </Text>
    </div>
  );
}

MarkdownText.propTypes = {
  content: PropTypes.string,
};

export default MarkdownText;
