/**
 *
 * ModulePolicy: TopicCard
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Markdown from 'react-remarkable';
import { DEFAULT_LOCALE } from 'i18n';

import styled, { withTheme } from 'styled-components';
import { Text, Box, Button, ResponsiveContext } from 'grommet';

import { POLICY_TOPIC_ICONS } from 'config';
import { isMinSize } from 'utils/responsive';

// import commonMessages from 'messages';
import messages from './messages';

// prettier-ignore
const TopicButton = styled(p => <Button plain {...p} />)`
  background: ${({ theme, secondary }) =>
    !secondary
      ? theme.global.colors.topicCards.default.background
      : theme.global.colors.topicCards.secondary.background};
  box-shadow: ${({ secondary }) =>
    secondary ? 'rgba(0, 0, 0, 0.2) 0px 2px 4px' : 'none'};
  &:hover {
    background: ${({ theme, secondary }) =>
    !secondary
      ? theme.global.colors.topicCards.default.backgroundHover
      : theme.global.colors.topicCards.secondary.background};
  }
`;
// prettier-ignore
const TopicInner = styled(p => (
  <Box elevation="small" pad="small" responsive={false} {...p} />
))`
  position: relative;
  background-color: ${({ theme, secondary }) =>
    !secondary
      ? theme.global.colors.topicCards.default.background
      : theme.global.colors.topicCards.secondary.background};
  box-shadow: none;
  &:hover {
    box-shadow: ${({ theme, secondary }) =>
    !secondary
      ? `${
        theme.global.colors.topicCards.default.backgroundHover
      } 4px 2px 4px`
      : 'none'};
    background: ${({ theme, secondary }) =>
    !secondary
      ? theme.global.colors.topicCards.default.backgroundHover
      : theme.global.colors.topicCards.secondary.backgroundHover};
  }
  border: ${({ secondary }) => secondary ? 'none' : '1px solid white'};
`;

const Styled = styled(props => <Box {...props} />)`
  width: 100%;
  min-width: 200px;
  hyphens: auto;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 50%;
    padding: 0 6px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    width: ${({ count, secondary }) => (secondary ? 50 : 100 / count)}%;
  }
`;
const Teaser = styled(p => <Text size="small" {...p} />)`
  color: ${({ theme, secondary }) =>
    secondary ? theme.global.colors.text.light : 'white'};
`;
const TitleShort = styled(p => <Text size="xlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
  text-align: ${({ secondary }) => (secondary ? 'left' : 'center')};
  color: ${({ theme, secondary }) =>
    secondary ? theme.global.colors.brand : 'white'};
`;

const Show = styled.div`
  position: absolute;
  bottom: ${({ isOffset }) => (isOffset ? 0 : 8)}px;
  left: ${({ isOffset }) => (isOffset ? '50%' : 'auto')};
  right: ${({ isOffset }) => (isOffset ? 'auto' : '12px')};
  transform: translate(0, ${({ isOffset }) => (isOffset ? 50 : 0)}%);
`;
const ShowText = styled.div`
  color: ${({ isHover, theme }) =>
    !isHover
      ? theme.global.colors.topicCards.default.buttonFont
      : theme.global.colors.topicCards.default.buttonFontHover};
  border-radius: 99999px;
  background-color: white;
  font-family: wwfregular;
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1;
  transform: translate(${({ isOffset }) => (isOffset ? -50 : 0)}%, 0);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  padding: 4px 16px 5px;
  font-size: 16px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    font-size: 18px;
    padding: 6px 16px 8px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    font-size: 20px;
    padding: 9px 25px 11px;
  }
`;
const ShowTextSecondary = styled.div`
  color: ${({ isHover, theme }) =>
    !isHover
      ? theme.global.colors.topicCards.secondary.buttonFont
      : theme.global.colors.topicCards.secondary.buttonFontHover};
  font-family: wwfregular;
  text-transform: uppercase;
  line-height: 1;
  border-radius: 99999px;
  background-color: white;
  padding: 4px 16px 5px;
  font-size: 16px;
  box-shadow: rgb(0, 0, 0, 0.2) 0px 2px 4px;
`;

export function TopicCard({ intl, onTopicSelect, topic, count, secondary }) {
  const { locale } = intl;
  const [isHover, setIsHover] = useState(false);
  const Icon = p => POLICY_TOPIC_ICONS[topic.id](p);
  const size = React.useContext(ResponsiveContext);
  const hasSelectButtonOffset = isMinSize(size, 'large') && !secondary;
  return (
    <Styled
      className="mpx-topic-select"
      count={count}
      secondary={secondary}
      margin={{ bottom: hasSelectButtonOffset ? 'large' : 'medium' }}
    >
      <TopicButton
        plain
        hoverIndicator={false}
        secondary={secondary}
        onClick={() => onTopicSelect(topic.id)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <TopicInner isHover={isHover} secondary={secondary}>
          <Box align={secondary ? 'start' : 'center'}>
            <Icon color={secondary ? 'brand' : 'white'} />
            <TitleShort isHover={isHover} secondary={secondary}>
              {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
            </TitleShort>
          </Box>
          <Box
            align={secondary ? 'start' : 'center'}
            responsive={false}
            margin={{
              top: 'small',
              bottom: hasSelectButtonOffset ? 'medium' : 'ml',
            }}
          >
            <Teaser isHover={isHover} secondary={secondary}>
              <Markdown
                source={
                  topic[`teaser_${locale}`] || topic[`teaser_${DEFAULT_LOCALE}`]
                }
              />
            </Teaser>
          </Box>
          <Show
            secondary={secondary}
            isHover={isHover}
            isOffset={hasSelectButtonOffset}
          >
            {!secondary && (
              <ShowText isHover={isHover} isOffset={hasSelectButtonOffset}>
                <FormattedMessage {...messages.show} />
              </ShowText>
            )}
            {secondary && (
              <ShowTextSecondary
                isHover={isHover}
                isOffset={hasSelectButtonOffset}
              >
                <FormattedMessage {...messages.show} />
              </ShowTextSecondary>
            )}
          </Show>
        </TopicInner>
      </TopicButton>
    </Styled>
  );
}

TopicCard.propTypes = {
  onTopicSelect: PropTypes.func,
  count: PropTypes.number,
  topic: PropTypes.object,
  intl: intlShape.isRequired,
  theme: PropTypes.object,
  secondary: PropTypes.bool,
};

export default injectIntl(withTheme(TopicCard));
