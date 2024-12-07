import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Markdown from 'react-remarkable';
import styled from 'styled-components';
import { Text, Button } from 'grommet';

import {
  formatMessageForValues,
  truncateText,
  sanitiseMarkdown,
} from 'utils/string';

import messages from './messages';

const StyledButton = styled(p => <Button alignSelf="end" plain {...p} />)`
  position: relative;
  top: -12px;
  text-decoration: underline;
  color: ${({ theme }) => theme.global.colors.brand};
  &:hover {
    color: ${({ theme }) => theme.global.colors.brandDark};
  }
`;

const HeaderButtonText = styled(p => (
  <Text size="smaller" weight={600} {...p} />
))``;

export function MarkdownText({
  intl,
  format,
  moreLess,
  formatValues,
  content,
  ...p
}) {
  const [more, setMore] = React.useState(!moreLess);
  let source = content;
  if (format) {
    source = formatMessageForValues({
      intl,
      message: content,
      values: formatValues,
    });
  }
  //  prettier-ignore
  const sourceClean = moreLess && !more
    ? truncateText(
      source,
      moreLess.limit || 200, // limit
    )
    : sanitiseMarkdown(source);
  const labelsClean = moreLess && {
    more:
      (moreLess.labels && moreLess.labels.more) ||
      intl.formatMessage(messages.more),
    less:
      (moreLess.labels && moreLess.labels.less) ||
      intl.formatMessage(messages.less),
  };
  //
  // console.log(source)
  // console.log(sourceClean)

  return (
    <div className="mpx-markdown-text">
      <Text {...p}>
        <Markdown source={sourceClean} />
      </Text>
      {moreLess && (sourceClean.length < source.length || more) && (
        <StyledButton onClick={() => setMore(!more)}>
          <HeaderButtonText>
            {more && labelsClean.less}
            {!more && labelsClean.more}
          </HeaderButtonText>
        </StyledButton>
      )}
    </div>
  );
}

MarkdownText.propTypes = {
  content: PropTypes.string,
  format: PropTypes.bool,
  formatValues: PropTypes.object,
  moreLess: PropTypes.object,
  intl: intlShape,
};

export default injectIntl(MarkdownText);
