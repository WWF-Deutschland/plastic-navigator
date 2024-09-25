/**
 *
 * ModulePolicy: AggregateTopicCard
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

const TopicButton = styled(p => <Button plain {...p} />)``;

// prettier-ignore
const TopicInner = styled(p => (<Box pad='medium' {...p} />))`
  position: relative;
  background-color: ${({ theme }) =>
    theme.global.colors.topicCards.aggregate.background};
  &:hover {
    box-shadow: ${({ theme }) => theme.global.colors.topicCards.aggregate.dropShadow} 4px 2px 4px;
  }
`;

const Styled = styled(props => <Box {...props} />)`
  width: 100%;
  height: 100%;
  hyphens: auto;
`;
const Teaser = styled(p => <Text {...p} />)`
  color: ${({ theme }) => theme.global.colors.text.light};
  text-align: center;
`;
const TitleShort = styled(p => <Text {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  text-align: center;
  color: ${({ theme }) => theme.global.colors.brand};
`;
const ShowOnMapButton = styled(props => <Box {...props} />)`
  border-radius: 99999px;
  background-color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : theme.global.colors.brandDarker};
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  padding: 7px 20px 9px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: 10px 28px 12px;
  }
`;
const ShowText = styled(p => <Text {...p} />)`
  color: white;
  font-family: wwfregular;
  text-transform: uppercase;
  line-height: 1;
  font-size: 24px;
`;

export function AggregateTopicCard({ intl, onTopicSelect, topic, theme }) {
  const { locale } = intl;
  const [isHover, setIsHover] = useState(false);
  const Icon = p => POLICY_TOPIC_ICONS[topic.id](p);
  const size = React.useContext(ResponsiveContext);
  const isScreenSmall = size === 'small';
  return (
    <Styled className="mpx-topic-select">
      <TopicButton
        plain
        hoverIndicator={false}
        onClick={() => onTopicSelect(topic.id)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <TopicInner isHover={isHover}>
          <Box align="center" gap="small">
            <Icon
              color={theme.global.colors.brand}
              size={isScreenSmall ? '70px' : '90px'}
            />
            <TitleShort
              isHover={isHover}
              size={isScreenSmall ? 'xxlarge' : 'xxxlarge'}
            >
              {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
            </TitleShort>
          </Box>
          <Box
            align="center"
            margin={{ horizontal: isScreenSmall ? 'medium' : 'xlarge' }}
          >
            <Box margin={{ top: 'medium', bottom: 'small' }}>
              <Teaser
                isHover={isHover}
                size={isScreenSmall ? 'medium' : 'large'}
              >
                <Markdown
                  source={
                    topic[`teaser_${locale}`] ||
                    topic[`teaser_${DEFAULT_LOCALE}`]
                  }
                />
              </Teaser>
            </Box>
            <Box align="center" margin="medium">
              <ShowOnMapButton isHover={isHover}>
                <ShowText isHover={isHover}>
                  <FormattedMessage {...messages.showOnMap} />
                </ShowText>
              </ShowOnMapButton>
            </Box>
          </Box>
        </TopicInner>
      </TopicButton>
    </Styled>
  );
}

AggregateTopicCard.propTypes = {
  onTopicSelect: PropTypes.func,
  topic: PropTypes.object,
  intl: intlShape.isRequired,
  theme: PropTypes.object,
};

export default injectIntl(withTheme(AggregateTopicCard));
