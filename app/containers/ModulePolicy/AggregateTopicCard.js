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
import { Text, Box, Button } from 'grommet';

import { POLICY_TOPIC_ICONS } from 'config';

// import commonMessages from 'messages';
import messages from './messages';

const TopicButton = styled(p => <Button plain {...p} />)``;

const TopicInner = styled(p => (
  <Box elevation="small" pad="small" responsive={false} {...p} />
))`
  position: relative;
  background-color: ${({ theme }) => theme.global.colors.topicCards.aggregate.background};
  box-shadow: ${({ theme }) => theme.global.colors.topicCards.aggregate.dropShadow} 0px 2px 2px;
`;

const Styled = styled(props => <Box {...props} />)`
  width: 100%;
  height: 100%;
  hyphens: auto;
`;
const Teaser = styled(p => <Text size="small" {...p} />)`
  color: ${({ theme }) => theme.global.colors.text.light};
`;
const TitleShort = styled(p => <Text size="xxxlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  text-align: center;
  color: ${({ theme, isHover }) => !isHover ? theme.global.colors.brand : theme.global.colors.brandDarker};
`;
const Show = styled.div``;
const ShowText = styled.div`
  background-color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : theme.global.colors.brandDarker};
  border-radius: 99999px;
  color: white;
  font-family: wwfregular;
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1;
  transform: translate(${({ isOffset }) => (isOffset ? -50 : 0)}%, 0);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  padding: 8px 16px 10px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    font-size: 22px;
    padding: 6px 16px 8px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    font-size: 30px;
    padding: 9px 25px 11px;
  }
`;

export function AggregateTopicCard({
  intl,
  onTopicSelect,
  topic,
  theme,
}) {
  const { locale } = intl;
  const [isHover, setIsHover] = useState(false);
  const Icon = p => POLICY_TOPIC_ICONS[topic.id](p);
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
          <Box align="center">
            <Icon color={theme.global.colors.brand} />
            <TitleShort isHover={isHover}>
              {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
            </TitleShort>
          </Box>
          <Box align="center" responsive={false}>
            <Box margin={{ top: 'medium' }}>
              <Teaser isHover={isHover}>
                <Markdown
                  source={
                    topic[`teaser_${locale}`] || topic[`teaser_${DEFAULT_LOCALE}`]
                  }
                />
              </Teaser>
            </Box>
            <Box align="center" margin="medium">
              <Show isHover={isHover}>
                <ShowText isHover={isHover}>
                  <FormattedMessage {...messages.showOnMap} />
                </ShowText>
              </Show>
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
