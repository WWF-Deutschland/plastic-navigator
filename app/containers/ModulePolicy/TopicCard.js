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

// prettier-ignore
const ShowButton = styled(props => <Box {...props} />)`
  position: absolute;
  bottom: ${({ isOffset }) => (isOffset ? 0 : 8)}px;
  left: ${({ isOffset }) => (isOffset ? '50%' : 'auto')};
  right: ${({ isOffset }) => (isOffset ? 'auto' : '12px')};
  transform: translate(${({ isOffset }) => (isOffset ? '-50%,50%' : '0,0')});
  box-shadow: ${({ secondary, theme }) =>
    (secondary
      ? 'rgba(0, 0, 0, 0.2)'
      : theme.global.colors.topicCards.default.buttonFontHover)} 0px 2px 4px;
  padding: 4px 16px 5px;
  background-color: white;
  border-radius: 99999px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: ${({ secondary }) => (secondary ? '5px 28px 7px' : '6px 26px 8px')};
  }
  `;
// prettier-ignore
const ShowText = styled(p => <Text {...p} />)`
  color: ${({ isHover, secondary, theme }) => {
    const topicCardStyles =
      secondary
        ? theme.global.colors.topicCards.secondary
        : theme.global.colors.topicCards.default;
    return (!isHover
      ? topicCardStyles.buttonFont
      : topicCardStyles.buttonFontHover);
  }};
  font-family: wwfregular;
  text-transform: uppercase;
  line-height: 1;
  font-size: 19px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
   font-size: ${({ secondary }) => (secondary ? '19px' : '21px')};
  }
`;
function getIconSize(secondary, screenSize) {
  if (secondary) {
    return '40px';
  }
  if (screenSize === 'small') {
    return '60px';
  }
  return '70px';
}

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
            <Icon
              color={secondary ? 'brand' : 'white'}
              size={getIconSize(secondary, size)}
            />
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
          <ShowButton
            secondary={secondary}
            isHover={isHover}
            isOffset={hasSelectButtonOffset}
          >
            <ShowText
              isHover={isHover}
              isOffset={hasSelectButtonOffset}
              secondary={secondary}
            >
              <FormattedMessage {...messages.show} />
            </ShowText>
          </ShowButton>
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
