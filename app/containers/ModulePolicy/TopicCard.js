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

// import commonMessages from 'messages';
import messages from './messages';

// prettier-ignore
const TopicButton = styled(p => <Button plain {...p} />)`
  background: ${({ theme, archived }) =>
    !archived
      ? theme.global.colors.topicCards.default.background
      : theme.global.colors.topicCards.archived.background};
  box-shadow: ${({ archived }) =>
    archived ? '0px 4px 8px rgba(0,0,0,0.20)' : 'none'};
  border: ${({ archived }) => archived ? 'none' : '1px solid white'};

  &:hover {
    background: ${({ theme, archived }) =>
    !archived
      ? theme.global.colors.topicCards.default.backgroundHover
      : theme.global.colors.topicCards.archived.background};
    box-shadow: ${({ archived }) =>
    archived ? '0px 4px 8px rgba(0,0,0,0.30)' : '0px 4px 8px rgba(0,0,0,0.20)'};
  }
`;
// prettier-ignore
const TopicInner = styled(p => (
  <Box pad="small" responsive={false} {...p} />
))`
  position: relative;
  box-shadow: none;
`;

const Styled = styled(props => <Box {...props} />)`
  width: 100%;
  hyphens: auto;

  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 50%;
    padding: 0 6px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    width: ${({ count, archived }) => (archived ? 50 : 100 / count)}%;
  }
`;
const Teaser = styled(p => <Text size="small" {...p} />)`
  color: ${({ theme, archived }) =>
    archived ? theme.global.colors.text.light : 'white'};
`;
const TitleShort = styled(p => <Text size="xlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
  text-align: ${({ archived }) => (archived ? 'left' : 'center')};
  color: ${({ theme, archived }) =>
    archived ? theme.global.colors.brand : 'white'};
`;

// prettier-ignore
const ShowButton = styled(props => <Box {...props} />)`
  position: absolute;
  bottom: ${({ archived }) => (!archived ? 0 : 8)}px;
  left: ${({ archived }) => (!archived ? '50%' : 'auto')};
  right: ${({ archived }) => (!archived ? 'auto' : '12px')};
  transform: translate(${({ archived }) => (!archived ? '-50%,50%' : '0,0')});
  box-shadow: ${({ isHover }) => (isHover ? '2px 2px 6px rgba(0,0,0,0.15)' : '2px 2px 6px rgba(0,0,0,0.10)')};
  padding: 8px 21px;
  background-color: white;
  border-radius: 99999px;
  color: ${({ archived, isHover, theme }) => {
    const topicCardStyles =
    theme.global.colors.topicCards[archived ? 'archived' : 'default'];
    return topicCardStyles[isHover ? 'buttonFont' : 'buttonFontHover'];
  }};
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: ${({ archived }) => (archived ? '8px 21px' : '8px 23px')};
  }
  `;
// prettier-ignore
const ShowText = styled(p => <Text {...p} />)`
  font-family: wwfregular;
  text-transform: uppercase;
  line-height: 1;
  margin-top: -1px;
  font-size: 19px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
   font-size: ${({ archived }) => (archived ? '19px' : '21px')};
  }
`;
function getIconSize(archived, screenSize) {
  if (archived) {
    return '40px';
  }
  if (screenSize === 'small') {
    return '60px';
  }
  return '70px';
}

export function TopicCard({ intl, onTopicSelect, topic, count, archived }) {
  const { locale } = intl;
  const [isHover, setIsHover] = useState(false);
  const Icon = p => POLICY_TOPIC_ICONS[topic.id](p);
  const size = React.useContext(ResponsiveContext);

  return (
    <Styled
      className="mpx-topic-select"
      count={count}
      archived={archived}
      responsive={false}
      margin={{ bottom: !archived ? 'large' : 'medium' }}
    >
      <TopicButton
        plain
        hoverIndicator={false}
        archived={archived}
        onClick={() => onTopicSelect(topic.id)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <TopicInner>
          <Box align={archived ? 'start' : 'center'}>
            <Icon
              color={archived ? 'brand' : 'white'}
              size={getIconSize(archived, size)}
            />
            <TitleShort isHover={isHover} archived={archived}>
              {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
            </TitleShort>
          </Box>
          <Box
            align={archived ? 'start' : 'center'}
            responsive={false}
            margin={{
              top: 'small',
              bottom: !archived ? 'medium' : 'ml',
            }}
          >
            <Teaser isHover={isHover} archived={archived}>
              <Markdown
                source={
                  topic[`teaser_${locale}`] || topic[`teaser_${DEFAULT_LOCALE}`]
                }
              />
            </Teaser>
          </Box>
          <ShowButton archived={archived} isHover={isHover}>
            <ShowText archived={archived}>
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
  archived: PropTypes.bool,
};

export default injectIntl(withTheme(TopicCard));
