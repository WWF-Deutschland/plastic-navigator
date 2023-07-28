/**
 *
 * LayerInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_TOPIC_ICONS } from 'config';

import { getStatementWithPositionsAndCountries } from 'utils/policy';
import qe from 'utils/quasi-equals';
import formatDate from 'utils/format-date';

import Checkbox from 'components/Checkbox';
import MarkdownText from 'components/MarkdownText';

import coreMessages from 'messages';

import CountryPositionSymbol from './CountryPositionSymbol';
import FeatureListCollapsable from '../FeatureListCollapsable';

import Title from '../Title';

import PanelBody from '../PanelBody';
import messages from '../messages';

const TitleWrap = styled(p => (
  <Box margin={{ top: 'small', bottom: 'small' }} {...p} />
))``;
const PanelHeader = styled(p => (
  <Box justify="between" {...p} responsive={false} />
))`
  padding: 12px 24px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 24px 0;
  }
`;

const OptionsLabel = styled(Text)`
  font-weight: bold;
  text-transform: uppercase;
`;

const DateWrapper = styled.div`
  margin-bottom: 5px;
`;
const TopicPositions = styled(p => (
  <Box gap="small" margin={{ top: 'small', bottom: 'medium' }} {...p} />
))``;

// prettier-ignore
const TopicButton = styled(p => <Button plain {...p} />)`
  cursor: ${({ active }) => active ? 'default' : 'pointer'};
  &:hover {
    box-shadow: ${({ active }) =>
    active ? 'none' : 'rgba(0, 0, 0, 0.2) 0px 2px 4px'};
  }
`;
const TopicInner = styled(p => (
  <Box elevation={p.active ? 'medium' : 'xsmall'} pad="small" {...p} />
))`
  position: relative;
  background-color: ${({ isHover, theme }) =>
    isHover ? theme.global.colors.brand : 'white'};
`;

const TopicButtonWrap = styled(props => <Box {...props} />)``;
const TopicDescription = styled(p => <Text size="small" {...p} />)`
  color: ${({ isHover, theme }) =>
    !isHover ? theme.global.colors.text.light : 'white'};
`;
const TopicTitleShort = styled(p => <Text size="xlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: -3px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const P = styled.p`
  margin-top: 0;
  margin-bottom: 0;
`;
const Quote = styled(P)``;

const SectionTitleWrap = styled.div`
  margin-bottom: 5px;
`;
const SectionTitle = styled(p => <Text size="small" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
const StyledButton = styled(p => (
  <Button plain as="a" target="_blank" {...p} />
))`
  text-decoration: underline;
`;

export function SourceContent({
  sourceId,
  indicatorId,
  layerInfo,
  onSetIndicator,
  intl,
  layerId,
}) {
  const { locale } = intl;
  if (!sourceId || !layerInfo) return null;

  const sourceWithPositions = getStatementWithPositionsAndCountries({
    layerInfo,
    statementId: sourceId,
    locale,
  });
  if (!sourceWithPositions) return null;
  const title =
    sourceWithPositions[`title_${locale}`] ||
    sourceWithPositions[`title_${DEFAULT_LOCALE}`];
  const multipleTopics =
    sourceWithPositions.positions && sourceWithPositions.positions.length > 1;
  // prettier-ignore
  return (
    <>
      <PanelHeader>
        <TitleWrap>
          <DateWrapper>
            <Text
              size="medium"
              color="textSecondary"
              style={{ fontWeight: 600 }}
            >
              {formatDate(locale, new Date(sourceWithPositions.date).getTime())}
            </Text>
          </DateWrapper>
          <Title>{title}</Title>
        </TitleWrap>
      </PanelHeader>
      <PanelBody hasHeader>
        <OptionsLabel>
          <FormattedMessage
            {...messages[
              multipleTopics ? 'multipleTopics' : 'singleTopic'
            ]}
          />
        </OptionsLabel>
        <TopicPositions>
          {sourceWithPositions.positions.map(p => {
            const Icon = props => POLICY_TOPIC_ICONS[p.topic_id](props);
            const active = qe(indicatorId, p.topic_id);
            return (
              <TopicButtonWrap key={p.topic_id}>
                <TopicButton
                  plain
                  hoverIndicator={false}
                  onClick={() => active || onSetIndicator(p.topic_id)}
                  active={active}
                >
                  <TopicInner active={active}>
                    <Box direction="row" align="center" justify="between">
                      <TopicTitleShort>
                        {p.topic[`short_${locale}`] ||
                          p.topic[`short_${DEFAULT_LOCALE}`]}
                      </TopicTitleShort>
                      <Box direction="row" align="center" gap="small">
                        <Icon color="black" />
                        <Checkbox inButton checked={active} activeColor="brand" />
                      </Box>
                    </Box>
                    <Box margin={{ top: 'xsmall' }}>
                      <TopicDescription>
                        <MarkdownText
                          content={
                            p.topic[`description_${locale}`] ||
                            p.topic[`description_${DEFAULT_LOCALE}`]
                          }
                        />
                      </TopicDescription>
                    </Box>
                    <Box
                      direction="row"
                      justify="start"
                      gap="small"
                      align="center"
                      margin={{
                        vertical: 'small',
                      }}
                    >
                      <CountryPositionSymbol
                        position={p}
                        config={layerInfo.config}
                        inKey={false}
                      />
                      <Box flex={{ grow: 1, shrink: 1 }}>
                        <MarkdownText
                          content={
                            p[`position_${locale}`] ||
                            p[`position_${DEFAULT_LOCALE}`]
                          }
                          format
                          formatValues={{ isSingle: false }}
                        />
                      </Box>
                    </Box>
                  </TopicInner>
                </TopicButton>
              </TopicButtonWrap>
            );
          })}
        </TopicPositions>
        {(sourceWithPositions[`quote_${locale}`] ||
          sourceWithPositions[`quote_${DEFAULT_LOCALE}`]) && (
          <Section>
            <SectionTitleWrap>
              <SectionTitle>
                <FormattedMessage {...messages.quote} />
              </SectionTitle>
            </SectionTitleWrap>
            <Quote>
              {sourceWithPositions[`quote_${locale}`] ||
                sourceWithPositions[`quote_${DEFAULT_LOCALE}`]}
            </Quote>
          </Section>
        )}
        {sourceWithPositions &&
          (sourceWithPositions[`source_${locale}`] ||
            sourceWithPositions[`source_${DEFAULT_LOCALE}`]) && (
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.source} />
            </SectionTitle>
            {sourceWithPositions.url && (
              <P>
                <StyledButton
                  href={sourceWithPositions.url}
                  label={
                    <Text>
                      {sourceWithPositions[`source_${locale}`] ||
                      sourceWithPositions[`source_${DEFAULT_LOCALE}`]}
                    </Text>
                  }
                />
              </P>
            )}
            {!sourceWithPositions.url && (
              <P>
                <Text>
                  {sourceWithPositions[`source_${locale}`] ||
                  sourceWithPositions[`source_${DEFAULT_LOCALE}`]}
                </Text>
              </P>
            )}
          </Section>
        )}
        {sourceWithPositions && sourceWithPositions.countries && sourceWithPositions.countries.length > 0 && (
          <Section>
            <FeatureListCollapsable
              isSourceList={false}
              items={sourceWithPositions.countries}
              layerId={layerId}
              title={
                intl.formatMessage(
                  coreMessages.countries,
                  {
                    count: sourceWithPositions.countries.length,
                    isSingle: sourceWithPositions.countries.length === 1,
                  },
                )
              }
            />
          </Section>
        )}
      </PanelBody>
    </>
  );
}

SourceContent.propTypes = {
  indicatorId: PropTypes.string,
  sourceId: PropTypes.string,
  layerId: PropTypes.string,
  layerInfo: PropTypes.object,
  onSetIndicator: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(SourceContent);
