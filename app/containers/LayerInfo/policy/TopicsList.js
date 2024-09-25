/**
 *
 * SourceList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Box, Heading, Text } from 'grommet';

import { intlShape, injectIntl } from 'react-intl';

import { ArrowRightL } from 'components/Icons';
import TopicsSymbol from './TopicsSymbol';
import messages from '../messages';

const ListWrap = styled(Box)`
  margin-top: 5px;
`;

const ListTitle = styled(p => <Heading level={4} {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  font-size: 24px;
  line-height: 1;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: normal;
`;

const TopicButton = styled(p => (
  <Button {...p} plain fill="horizontal" alignSelf="start" />
))`
  border-top: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  }
`;

export function TopicsList({ topics, intl, onSetTopic }) {
  const title = intl.formatMessage(messages.topicsTabTitle, {
    count: topics.length,
    isSingle: topics.length === 1,
  });
  return (
    <ListWrap>
      <ListTitle>{title}</ListTitle>
      {topics.length > 0 && (
        <Box>
          {topics.map(item => (
            <TopicButton
              key={item.id}
              onClick={() => (onSetTopic ? onSetTopic(item.id) : null)}
              label={
                <Box
                  direction="row"
                  justify="between"
                  pad={{ vertical: 'small', right: 'small', left: 'small' }}
                  align="center"
                  responsive={false}
                  gap="xsmall"
                >
                  <Box
                    direction="row"
                    justify="start"
                    gap="small"
                    align="center"
                  >
                    <TopicsSymbol topicId={parseInt(item.id, 10)} />
                    <Box>
                      <Text>{item.label || item.id}</Text>
                    </Box>
                  </Box>
                  <ArrowRightL />
                </Box>
              }
            />
          ))}
        </Box>
      )}
    </ListWrap>
  );
}

TopicsList.propTypes = {
  topics: PropTypes.array,
  onSetTopic: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(TopicsList);
