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

import messages from './messages';

const Styled = styled(Box)`
  color: ${({ theme }) => theme.global.colors['dark-3']};
`;
const StyledButton = styled(Button)`
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

const Label = styled(p => <Text size="xxsmall" {...p} />)``;
const Para = styled(p => <Paragraph size="xsmall" {...p} />)`
  margin: 5px 0 10px;
`;

export function Attribution({ map, intl, onNavAbout }) {
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
        >
          <StyledButton
            plain
            onClick={() => onNavAbout()}
            label={
              <Label>
                <FormattedMessage {...messages.copyright} />
              </Label>
            }
          />
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
  onNavAbout: PropTypes.func,
  intl: intlShape.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    onNavAbout: () => dispatch(navigatePage(PAGES.about.path)),
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(Attribution));
