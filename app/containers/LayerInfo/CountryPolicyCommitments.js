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

import { sortPositions } from 'utils/positions';
import CountryPositionSymbol from './CountryPositionSymbol';

import messages from './messages';

const Styled = styled.div``;
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

const MultipleWrap = styled.div`
  margin-bottom: 10px;
`;

const CountryPolicyCommitments = ({ config, feature, intl }) => {
  const { locale } = intl;
  const { positions } = feature.properties;
  if (!positions || positions.length < 1) return null;
  const sorted = sortPositions(positions, config);

  // prettier-ignore
  return (
    <Styled>
      {positions.length > 1 && (
        <MultipleWrap>
          <Text size="small">
            <FormattedMessage {...messages.multiplePositions} />
          </Text>
        </MultipleWrap>
      )}
      {sorted.map(position => (
        <div key={`${position.position_id}${position.source_id}`}>
          {positions.length > 1 && <BorderBottomWrap />}
          {position.position && (
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.position} />
              </SectionTitle>
              <Box direction="row" gap="small" margin={{ bottom: 'medium' }} align="center">
                {position && config && (
                  <CountryPositionSymbol
                    position={position}
                    config={config}
                  />
                )}
                <Text size="small">
                  {position.position[`position_${locale}`] ||
                    position.position[`position_${DEFAULT_LOCALE}`]}
                </Text>
              </Box>
            </Section>
          )}
          {position.source &&
            (position.source[`quote_${locale}`] ||
              position.source[`quote_${DEFAULT_LOCALE}`]) && (
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.quote} />
              </SectionTitle>
              <Quote>
                {position.source[`quote_${locale}`] ||
                  position.source[`quote_${DEFAULT_LOCALE}`]}
              </Quote>
              {position.source.date && (
                <P>
                  <Text size="xsmall">
                    (<FormattedDate value={new Date(position.source.date)} />)
                  </Text>
                </P>
              )}
            </Section>
          )}
          {position.source &&
            (position.source[`source_${locale}`] ||
              position.source[`source_${DEFAULT_LOCALE}`]
            ) && (
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.source} />
              </SectionTitle>
              {position.source.url && (
                <P>
                  <StyledButton
                    href={position.source.url}
                    label={
                      <Text>
                        {position.source[`source_${locale}`] ||
                        position.source[`source_${DEFAULT_LOCALE}`]}
                      </Text>
                    }
                  />
                </P>
              )}
              {!position.source.url && (
                <P>
                  <Text>
                    {position.source[`source_${locale}`] ||
                    position.source[`source_${DEFAULT_LOCALE}`]}
                  </Text>
                </P>
              )}
            </Section>
          )}
        </div>
      ))}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  config: PropTypes.object, // the layer configuration
  feature: PropTypes.object, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(CountryPolicyCommitments);
