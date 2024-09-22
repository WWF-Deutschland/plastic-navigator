/**
 *
 * LayerInfo
 *
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Button, Box, Heading, Text, ResponsiveContext } from 'grommet';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { ArrowRightL, CloseXS } from 'components/Icons';

import { sortLabels } from 'utils/string';
import { isMinSize } from 'utils/responsive';
import formatDate from 'utils/format-date';

import CountryPositionSymbol from './policy/CountryPositionSymbol';
import TopicsSymbol from './policy/TopicsSymbol';
import TextInput from './TextInput';

import messages from './messages';

const ListTitle = styled(p => <Heading level={4} {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  font-size: 24px;
  line-height: 1;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: normal;
`;

const FeatureListWrap = styled(Box)`
  margin-top: 5px;
`;

const FeatureButton = styled(p => (
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

export function FeatureList({
  title,
  items,
  onSetItemInfo,
  onSetTopic,
  config,
  search,
  placeholder,
  isSourceList,
  isTopicsList,
  intl,
}) {
  const [test, setTest] = useState('');
  const textInputRef = useRef(null);
  const { locale } = intl;
  const itemsFiltered =
    search && test.length > 0
      ? items.filter(item => search(item, test))
      : items;
  const sorted = itemsFiltered.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1;
    }
    return sortLabels(a.label || a.id, b.label || b.id);
  });

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <FeatureListWrap>
          <ListTitle>{title}</ListTitle>
          {search && (
            <Box
              direction="row"
              align="center"
              round="xlarge"
              height="20px"
              pad={{ horizontal: 'ms', vertical: 'ms' }}
              margin={{ bottom: 'small' }}
              background="light"
              border
              responsive={false}
            >
              <TextInput
                plain
                value={test}
                onChange={evt => {
                  if (evt && evt.target) {
                    setTest(evt.target.value);
                  }
                }}
                placeholder={
                  placeholder || intl.formatMessage(messages.placeholderDefault)
                }
                ref={textInputRef}
              />
              {test.length > 0 && (
                <Button
                  plain
                  fill="vertical"
                  onClick={() => setTest('')}
                  icon={<CloseXS />}
                  style={{
                    textAlign: 'center',
                    height: '20px',
                  }}
                />
              )}
            </Box>
          )}
          {sorted.length === 0 && (
            <Box pad="small">
              <Text style={{ fontStyle: 'italic' }} color="textSecondary">
                <FormattedMessage {...messages.noSearchResults} />
              </Text>
            </Box>
          )}
          {sorted.length > 0 && (
            <Box>
              {sorted.map(item => (
                <FeatureButton
                  key={item.id}
                  onClick={() => {
                    if (onSetItemInfo) {
                      return onSetItemInfo(item.id);
                    }
                    if (onSetTopic) {
                      return onSetTopic(item.id);
                    }
                    return null;
                  }}
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
                        {item.position && config && (
                          <CountryPositionSymbol
                            position={item.position}
                            config={config}
                          />
                        )}
                        {isTopicsList && item.id && (
                          <TopicsSymbol topicId={parseInt(item.id, 10)} />
                        )}
                        <Box>
                          {isSourceList && item.date && (
                            <Text
                              size={
                                isMinSize(size, 'medium')
                                  ? 'xxsmall'
                                  : 'xxxsmall'
                              }
                              color="textSecondary"
                            >
                              {formatDate(
                                locale,
                                new Date(item.date).getTime(),
                              )}
                            </Text>
                          )}
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
        </FeatureListWrap>
      )}
    </ResponsiveContext.Consumer>
  );
}

FeatureList.propTypes = {
  onSetItemInfo: PropTypes.func,
  onSetTopic: PropTypes.func,
  items: PropTypes.array,
  config: PropTypes.object,
  layerId: PropTypes.string,
  title: PropTypes.string,
  isSourceList: PropTypes.bool,
  isTopicsList: PropTypes.bool,
  placeholder: PropTypes.string,
  search: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(FeatureList);
