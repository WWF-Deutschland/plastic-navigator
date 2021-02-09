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

import { KeyArea } from 'components/KeyArea';

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

const IconImgWrap = styled.div`
  width: ${({ size }) => size.x}px;
`;
const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;

const IconImg = styled.img`
  width: 100%;
`;

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

const getSquareStyle = (config, position) => {
  if (
    config.render &&
    config.render.type === 'area' &&
    config.featureStyle &&
    config.featureStyle.property
  ) {
    const ps = config.featureStyle.property.split('.');
    const positionValue = position[ps[1]];
    const style = Object.keys(config.featureStyle.style).reduce(
      (styleMemo, attr) => {
        const attrObject = config.featureStyle.style[attr];
        // prettier-ignore
        const attrValue =
          attrObject[positionValue] ||
          attrObject.default ||
          attrObject.none ||
          attrObject.without ||
          attrObject['0'];
        return {
          ...styleMemo,
          [attr]: attrValue,
        };
      },
      {},
    );
    return {
      stroke: true,
      weight: 1,
      fill: true,
      fillOpacity: 0.4,
      ...style,
    };
  }
  return null;
};

const CountryPolicyCommitments = ({ config, feature, intl }) => {
  const { locale } = intl;
  const { positions } = feature.properties;
  if (!positions || positions.length < 0) return null;
  const sorted = positions
    .sort((a, b) => {
      const aDate = a.source && a.source.date && new Date(a.source.date);
      const bDate = b.source && b.source.date && new Date(b.source.date);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      if (aDate > bDate) return -1;
      return 1;
    })
    .sort((a, b) => {
      if (config.key && config.key.values) {
        const aIndex =
          a.position_id && config.key.values.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.values.indexOf(b.position_id);
        if (aIndex < bIndex) return -1;
        return 1;
      }
      return 1;
    });
  const iconuri =
    config.icon &&
    config.icon.datauri &&
    (config.icon.datauri.default || config.icon.datauri);
  const iconsize = { x: 50, y: 50 };

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
      {sorted.map(position => {
        const icon = iconuri && iconuri[position.position_id];
        const square = getSquareStyle(config, position);
        return (
          <div key={`${position.position_id}${position.source_id}`}>
            {positions.length > 1 && <BorderBottomWrap />}
            {position.position && (
              <Section>
                <SectionTitle>
                  <FormattedMessage {...messages.position} />
                </SectionTitle>
                <Box direction="row" gap="medium" margin={{ bottom: 'medium' }} align="center">
                  {icon && (
                    <IconImgWrap size={iconsize}>
                      <IconImg src={icon} />
                    </IconImgWrap>
                  )}
                  {square && (
                    <AreaWrap>
                      <KeyArea areaStyles={[square]} />
                    </AreaWrap>
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
        );
      })}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  config: PropTypes.object, // the layer configuration
  feature: PropTypes.object, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(CountryPolicyCommitments);
