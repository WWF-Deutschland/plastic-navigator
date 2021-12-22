import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import {
  ResponsiveContext,
  Box,
  Text,
  Drop,
  Button,
  Heading,
  Paragraph,
} from 'grommet';
import { navigatePage } from 'containers/App/actions';
import { PAGES } from 'config';

import { isMinSize } from 'utils/responsive';
import { Close } from 'components/Icons';

import commonMessages from 'messages';
import messages from './messages';

const Styled = styled(Box)`
  color: ${({ theme }) => theme.global.colors['dark-3']};
`;
const StyledButton = styled(Button)`
  text-decoration: none;
  color: ${({ theme }) => theme.global.colors['dark-3']};
  line-height: 15px;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.global.colors.brand};
  }
`;

const StyledHeading = styled(Heading)`
  margin: 0;
  font-size: 15px;
`;
const Title = styled(Heading)`
  font-family: 'wwfregular';
  line-height: 1;
  text-transform: uppercase;
  margin: 5px 0 10px;
  font-weight: 400;
`;

const Label = styled(p => <Text size="xxxsmall" {...p} />)`
  line-height: 1;
`;
const Para = styled(p => <Paragraph size="xsmall" {...p} />)`
  margin: 5px 0 10px;
`;

const ButtonClose = styled(p => (
  <Button icon={<Close color="white" />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.black};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
`;

export function Attribution({ map, intl, onNav }) {
  const attributionButtonRef = useRef(null);
  const [showAttribution, setShowAttribution] = useState(false);
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled
          direction="row"
          margin={isMinSize(size, 'medium') ? 'xsmall' : 'xxsmall'}
          gap="xxsmall"
          align="center"
          wrap
        >
          <StyledButton
            plain
            onClick={() => onNav(PAGES.about.path)}
            label={
              <Label>
                <FormattedMessage {...messages.copyright} />
              </Label>
            }
          />
          {!window.wwfMpxInsideWWFIframe && <Label>|</Label>}
          {!window.wwfMpxInsideWWFIframe && (
            <StyledButton
              plain
              onClick={() => onNav(PAGES.privacy.path)}
              label={
                <Label>
                  <FormattedMessage {...commonMessages.page_privacy} />
                </Label>
              }
            />
          )}
          {!window.wwfMpxInsideWWFIframe && <Label>|</Label>}
          {!window.wwfMpxInsideWWFIframe && (
            <StyledButton
              plain
              as="a"
              target="_blank"
              href={intl.formatMessage(messages.imprintURL)}
            >
              <Label>
                <FormattedMessage {...messages.imprintLabel} />
              </Label>
            </StyledButton>
          )}
          {(isMinSize(size, 'medium') || map) && <Label>|</Label>}
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
          {isMinSize(size, 'medium') && map && <Label>|</Label>}
          {isMinSize(size, 'medium') && (
            <StyledButton
              as="a"
              target="_blank"
              href={intl.formatMessage(messages.appByURL)}
            >
              <Label>
                {`${intl.formatMessage(
                  messages.appByLabel,
                )} ${intl.formatMessage(messages.appBy)}`}
              </Label>
            </StyledButton>
          )}
          {map && showAttribution && attributionButtonRef.current && (
            <Drop
              align={{ bottom: 'top', left: 'left' }}
              target={attributionButtonRef.current}
              plain
              onClickOutside={() => setShowAttribution(false)}
            >
              <Box
                pad={{ vertical: 'small', horizontal: 'medium' }}
                margin={{ bottom: 'xsmall' }}
                background="white"
                elevation="large"
                style={{ maxWidth: '100%', width: '360px' }}
                responsive={false}
              >
                <ButtonClose onClick={() => setShowAttribution(false)} />
                <Title level={2}>
                  <FormattedMessage {...messages.mapAttributionLabel} />
                </Title>
                <Box margin={{ top: 'small' }}>
                  <StyledHeading level={6}>
                    <FormattedMessage {...messages.mapAttributionLayersTitle} />
                  </StyledHeading>
                  <Para>
                    <FormattedMessage {...messages.mapAttributionLayersInfo} />
                  </Para>
                  <StyledHeading level={6}>
                    <FormattedMessage
                      {...messages.mapAttributionBasemapTitle}
                    />
                  </StyledHeading>
                  <Para>
                    <FormattedMessage {...messages.mapAttributionBasemapInfo} />
                  </Para>
                </Box>
              </Box>
            </Drop>
          )}
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

Attribution.propTypes = {
  map: PropTypes.bool,
  onNav: PropTypes.func,
  intl: intlShape.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    onNav: path => dispatch(navigatePage(path)),
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(Attribution));
