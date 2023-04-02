import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box, Text, Button } from 'grommet';
import { DEFAULT_LOCALE } from 'i18n';

import coreMessages from 'messages';
import formatDate from 'utils/format-date';
import { getPositionForStatement } from 'utils/policy';
import MarkdownText from 'components/MarkdownText';

import CountryPositionSymbol from './CountryPositionSymbol';
import FeatureListCollapsable from '../FeatureListCollapsable';

import messages from '../messages';

const StatementHeader = styled.div`
  margin: 30px 0 30px;
`;
const Section = styled.div`
  margin-bottom: 30px;
`;
const StyledButton = styled(p => (
  <Button plain as="a" target="_blank" {...p} />
))`
  text-decoration: underline;
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

const DateWrapper = styled.div`
  margin-bottom: 5px;
`;
const BorderBottomWrap = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  margin-bottom: 20px;
`;

const StatementTitle = styled(p => <Text size="xxlarge" {...p} />)`
  font-family: 'wwfregular';
  font-weight: normal;
  line-height: 1;
`;

const CountryPolicySingleStatement = ({
  config,
  statement,
  tables,
  indicatorId,
  multiple,
  intl,
  listCountries,
}) => {
  const { locale } = intl;
  const position = getPositionForStatement({
    topicId: indicatorId,
    statement,
    tables,
  });
  // prettier-ignore
  return (
    <>
      <StatementHeader>
        {statement.date && (
          <DateWrapper>
            <Text size="medium" color="textSecondary">
              {formatDate(
                locale,
                new Date(statement.date).getTime(),
              )}
            </Text>
          </DateWrapper>
        )}
        <StatementTitle>
          {statement &&
            (statement[`title_${locale}`] ||
              statement[`title_${DEFAULT_LOCALE}`])}
        </StatementTitle>
      </StatementHeader>
      {position && (
        <Section>
          <SectionTitleWrap>
            <SectionTitle>
              <FormattedMessage {...messages.statementPosition} />
            </SectionTitle>
          </SectionTitleWrap>
          <Box
            direction="row"
            justify="start"
            gap="small"
            align="center"
            margin={{
              horizontal: 'small',
            }}
          >
            <CountryPositionSymbol
              position={{ value: position.id }}
              config={config}
              inKey={false}
            />
            <Box flex={{ grow: 1, shrink: 1 }}>
              <MarkdownText
                content={
                  position[`position_${locale}`] ||
                  position[`position_${DEFAULT_LOCALE}`]
                }
              />
            </Box>
          </Box>
        </Section>
      )}
      {statement &&
        (statement[`quote_${locale}`] ||
          statement[`quote_${DEFAULT_LOCALE}`]) && (
        <Section>
          <SectionTitleWrap>
            <SectionTitle>
              <FormattedMessage {...messages.quote} />
            </SectionTitle>
          </SectionTitleWrap>
          <Quote>
            {statement[`quote_${locale}`] ||
              statement[`quote_${DEFAULT_LOCALE}`]}
          </Quote>
        </Section>
      )}
      {listCountries && statement && statement.countries && statement.countries.length > 0 && (
        <FeatureListCollapsable
          items={statement.countries}
          title={
            intl.formatMessage(
              coreMessages.countries,
              {
                count: statement.countries.length,
                isSingle: statement.countries.length === 1,
              },
            )
          }
        />
      )}
      {statement &&
        (statement[`source_${locale}`] ||
          statement[`source_${DEFAULT_LOCALE}`]
        ) && (
        <Section>
          <SectionTitleWrap>
            <SectionTitle>
              <FormattedMessage {...messages.source} />
            </SectionTitle>
          </SectionTitleWrap>
          {statement.url && (
            <P>
              <StyledButton
                href={statement.url}
                label={
                  <Text>
                    {statement[`source_${locale}`] ||
                    statement[`source_${DEFAULT_LOCALE}`]}
                  </Text>
                }
              />
            </P>
          )}
          {!statement.url && (
            <P>
              <Text>
                {statement[`source_${locale}`] ||
                statement[`source_${DEFAULT_LOCALE}`]}
              </Text>
            </P>
          )}
        </Section>
      )}
      {multiple && <BorderBottomWrap />}
    </>
  );
};

CountryPolicySingleStatement.propTypes = {
  config: PropTypes.object, // the layer configuration
  tables: PropTypes.object, // the feature
  statement: PropTypes.object, // the feature
  listCountries: PropTypes.bool, // the feature
  multiple: PropTypes.bool, // the feature
  indicatorId: PropTypes.string, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(CountryPolicySingleStatement);
