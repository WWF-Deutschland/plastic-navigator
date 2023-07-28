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

const TopicButton = styled(p => <Button plain {...p} />)`
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  }
`;
const TopicInner = styled(p => (
  <Box elevation="small" pad="small" responsive={false} {...p} />
))`
  position: relative;
  background-color: ${({ isHover, theme }) =>
    isHover ? theme.global.colors.brand : 'white'};
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
  position: absolute;
  bottom: ${({ isOffset }) => (isOffset ? 0 : 8)}px;
  left: ${({ isOffset }) => (isOffset ? '50%' : 'auto')};
  right: ${({ isOffset }) => (isOffset ? 'auto' : '12px')};
  transform: translate(0, ${({ isOffset }) => (isOffset ? 50 : 0)}%);
`;
const SelectText = styled.div`
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
const SelectTextSecondary = styled.div`
  color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.brand : 'white'};
  font-family: wwfregular;
  text-transform: uppercase;
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
            responsive={false}
            margin={{
              top: 'small',
              bottom: hasSelectButtonOffset ? 'medium' : 'ml',
            }}
          >
            <Teaser isHover={isHover}>
              <Markdown
                source={
                  topic[`teaser_${locale}`] || topic[`teaser_${DEFAULT_LOCALE}`]
                }
              />
            </Teaser>
          </Box>
          <Select
            secondary={secondary}
            isHover={isHover}
            isOffset={hasSelectButtonOffset}
          >
            {!secondary && (
              <SelectText isHover={isHover} isOffset={hasSelectButtonOffset}>
                <FormattedMessage {...messages.select} />
              </SelectText>
            )}
            {secondary && (
              <SelectTextSecondary
                isHover={isHover}
                isOffset={hasSelectButtonOffset}
              >
                <FormattedMessage {...messages.select} />
              </SelectTextSecondary>
            )}
          </Select>
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
// export default ModuleExplore;
