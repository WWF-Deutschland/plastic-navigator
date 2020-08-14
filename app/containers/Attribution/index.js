import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, Drop, Button, Heading, Paragraph } from 'grommet';
import messages from './messages';

const Styled = styled(Box)`
  color: ${({ theme }) => theme.global.colors['dark-3']};
`;
const StyledButton = styled(Button)`
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.global.colors.brand};
  }
`;

const ButtonText = styled(props => <Button plain {...props} />)`
  font-weight: bold;
  text-decoration: none;
  color: ${({ theme }) => theme.global.colors['dark-3']};
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.global.colors.brand};
  }
`;

const StyledHeading = styled(Heading)`
  margin: 0;
`;

const Label = styled(p => <Text size="xsmall" {...p} />)``;
const Para = styled(p => <Paragraph size="xsmall" {...p} />)`
  margin: 5px 0 10px;
`;

export function Attribution({ map, intl }) {
  const attributionButtonRef = useRef(null);
  const [showAttribution, setShowAttribution] = useState(false);
  return (
    <Styled direction="row" margin="small" gap="xsmall" align="center">
      <Label>
        <FormattedMessage {...messages.copyright} />
      </Label>
      <Label>|</Label>
      {map && (
        <StyledButton
          plain
          ref={attributionButtonRef}
          onClick={() => setShowAttribution(!showAttribution)}
          label={
            <Label>
              <FormattedMessage {...messages.mapAttributionLabel} />
            </Label>
          }
        />
      )}
      {map && <Label>|</Label>}
      <Label>
        <FormattedMessage {...messages.appByLabel} />
      </Label>
      <ButtonText
        as="a"
        target="_blank"
        href={intl.formatMessage(messages.appByURL)}
      >
        <Label>
          <FormattedMessage {...messages.appBy} />
        </Label>
      </ButtonText>
      {map && showAttribution && attributionButtonRef.current && (
        <Drop
          align={{ bottom: 'top', left: 'left' }}
          target={attributionButtonRef.current}
          plain
          onClickOutside={() => setShowAttribution(false)}
        >
          <Box
            pad="small"
            margin={{ bottom: 'xsmall' }}
            background="white"
            elevation="small"
            width={{ max: 'medium' }}
          >
            <StyledHeading level={5}>
              <FormattedMessage {...messages.mapAttributionLabel} />
            </StyledHeading>
            <Box margin={{ top: 'small' }}>
              <StyledHeading level={6}>
                <FormattedMessage {...messages.mapAttributionLayersTitle} />
              </StyledHeading>
              <Para>
                <FormattedMessage {...messages.mapAttributionLayersInfo} />
              </Para>
              <StyledHeading level={6}>
                <FormattedMessage {...messages.mapAttributionBasemapTitle} />
              </StyledHeading>
              <Para>
                <FormattedMessage {...messages.mapAttributionBasemapInfo} />
              </Para>
            </Box>
          </Box>
        </Drop>
      )}
    </Styled>
  );
}

Attribution.propTypes = {
  map: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Attribution);
