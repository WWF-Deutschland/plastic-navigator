/**
 *
 * ModulePolicy: TopicCard
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { DEFAULT_LOCALE } from 'i18n';
import Markdown from 'react-remarkable';

import styled, { withTheme } from 'styled-components';
import { Text, Box, Button } from 'grommet';

import { POLICY_TOPIC_ICONS } from 'config';

// import commonMessages from 'messages';
import messages from './messages';

const TopicButton = styled(p => <Button plain {...p} />)`
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  }
`;
const TopicInner = styled(p => <Box elevation="small" pad="small" {...p} />)`
  position: relative;
  background-color: ${({ isHover, theme }) =>
    isHover ? theme.global.colors.brand : 'white'};
`;

const TopicButtonWrap = styled(props => (
  <Box margin={{ bottom: 'large' }} {...props} />
))`
  width: 100%;
  min-width: 200px;
  max-width: 300px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: 50%;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: 0 6px;
    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
    width: ${({ count, secondary }) => (secondary ? 25 : 100 / count)}%;
  }
`;
const Teaser = styled(p => <Text size="small" {...p} />)`
  color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.text.light : 'white'};
`;
const TitleShort = styled(p => <Text size="xlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
  text-align: center;
  color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : 'white'};
`;

const Select = styled.div`
  position: ${({ secondary }) => (secondary ? 'static' : 'absolute')};
  bottom: 0;
  left: 50%;
  transform: translate(0, ${({ secondary }) => (secondary ? 0 : 50)}%);
`;
const SelectText = styled.div`
  background-color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : theme.global.colors.brandDarker};
  border-radius: 99999px;
  padding: 10px 25px 11px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  color: white;
  font-family: wwfregular;
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1;
  transform: translate(-50%, 0);
`;
const SelectTextSecondary = styled.div`
  color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : 'white'};
  font-family: wwfregular;
  text-transform: uppercase;
  font-size: 18px;
  line-height: 1;
`;

export function TopicCard({
  intl,
  onTopicSelect,
  topic,
  count,
  theme,
  secondary,
}) {
  const { locale } = intl;
  const [isHover, setIsHover] = useState(false);
  const Icon = p => POLICY_TOPIC_ICONS[topic.id](p);
  return (
    <TopicButtonWrap
      className="mpx-topic-select"
      key={topic.id}
      count={count}
      secondary={secondary}
    >
      <TopicButton
        plain
        hoverIndicator={false}
        onClick={() => onTopicSelect(topic.id)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <TopicInner isHover={isHover}>
          {!secondary && (
            <Box align="center">
              <Icon color={isHover ? 'white' : theme.global.colors.brand} />
              <TitleShort isHover={isHover}>
                {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
              </TitleShort>
            </Box>
          )}
          <Box
            align="center"
            margin={{ top: 'small', bottom: secondary ? 'small' : 'medium' }}
          >
            <Teaser isHover={isHover}>
              <Markdown
                source={
                  topic[`teaser_${locale}`] || topic[`teaser_${DEFAULT_LOCALE}`]
                }
              />
            </Teaser>
          </Box>
          <Select secondary={secondary} isHover={isHover}>
            {!secondary && (
              <SelectText isHover={isHover}>
                <FormattedMessage {...messages.select} />
              </SelectText>
            )}
            {secondary && (
              <SelectTextSecondary isHover={isHover}>
                <FormattedMessage {...messages.select} />
              </SelectTextSecondary>
            )}
          </Select>
        </TopicInner>
      </TopicButton>
    </TopicButtonWrap>
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
// export default ModuleExplore;
