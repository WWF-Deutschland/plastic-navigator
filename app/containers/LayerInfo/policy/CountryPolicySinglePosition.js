import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Heading, Box, Text, Button } from 'grommet';
import { DEFAULT_LOCALE } from 'i18n';

import coreMessages from 'messages';

import CountryPositionSymbol from './CountryPositionSymbol';
import FeatureListCollapsable from '../FeatureListCollapsable';

import messages from '../messages';

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

const SectionTitle = styled(p => <Heading level="5" {...p} />)`
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 8px;
`;

const BorderBottomWrap = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  margin-bottom: 20px;
`;

const CountryPolicySinglePosition = ({
  config,
  multiple,
  position,
  source,
  intl,
  listCountries,
}) => {
  const { locale } = intl;
  // prettier-ignore
  return (
    <>
      {multiple && <BorderBottomWrap />}
      {position && (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.position} />
          </SectionTitle>
          <Box
            direction="row"
            justify="start"
            gap="small"
            align="center"
            margin={{ bottom: 'medium' }}
          >
            {position && config && (
              <CountryPositionSymbol
                position={position}
                config={config}
              />
            )}
            <Box flex={{ grow: 1, shrink: 1, }}>
              <Text size="small">
                {position.position[`position_${locale}`] ||
                  position.position[`position_${DEFAULT_LOCALE}`]}
              </Text>
            </Box>
          </Box>
        </Section>
      )}
      {source &&
        (source[`quote_${locale}`] ||
          source[`quote_${DEFAULT_LOCALE}`]) && (
        <Section>
          {source.date && (
            <P>
              <Text size="xsmall" color="textSecondary">
                <FormattedDate value={new Date(source.date)} />
              </Text>
            </P>
          )}
          <SectionTitle>
            <FormattedMessage {...messages.quote} />
          </SectionTitle>
          <Quote>
            {source[`quote_${locale}`] ||
              source[`quote_${DEFAULT_LOCALE}`]}
          </Quote>
        </Section>
      )}
      {listCountries && source && source.countries && source.countries.length > 0 && (
        <FeatureListCollapsable
          items={source.countries}
          title={
            intl.formatMessage(
              coreMessages.countries,
              {
                count: source.countries.length,
                isSingle: source.countries.length === 1,
              },
            )
          }
        />
      )}
      {source &&
        (source[`source_${locale}`] ||
          source[`source_${DEFAULT_LOCALE}`]
        ) && (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.source} />
          </SectionTitle>
          {source.url && (
            <P>
              <StyledButton
                href={source.url}
                label={
                  <Text>
                    {source[`source_${locale}`] ||
                    source[`source_${DEFAULT_LOCALE}`]}
                  </Text>
                }
              />
            </P>
          )}
          {!source.url && (
            <P>
              <Text>
                {source[`source_${locale}`] ||
                source[`source_${DEFAULT_LOCALE}`]}
              </Text>
            </P>
          )}
        </Section>
      )}
    </>
  );
};

CountryPolicySinglePosition.propTypes = {
  config: PropTypes.object, // the layer configuration
  position: PropTypes.object, // the feature
  source: PropTypes.object, // the feature
  multiple: PropTypes.bool, // the feature
  listCountries: PropTypes.bool, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(CountryPolicySinglePosition);
