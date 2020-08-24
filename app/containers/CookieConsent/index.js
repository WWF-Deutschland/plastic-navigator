import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box, Layer, Paragraph, Heading, Button } from 'grommet';
import { navigatePage } from 'containers/App/actions';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';

import { PAGES } from 'config';

import ButtonText from 'components/ButtonText';

import { checkCookieConsent, setCookieConsent } from './actions';
import {
  selectCookieConsent,
  selectCookieConsentApp,
  selectCookieConsentChecked,
  selectCookieConsentShow,
} from './selectors';

import saga from './saga';
import reducer from './reducer';

import messages from './messages';

const Styled = styled.div`
  z-index: 99999;
`;
const StyledButtonText = styled(ButtonText)``;

const StyledButton = styled(p => <Button plain {...p} />)`
  background: ${({ theme }) => theme.global.colors.brand};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 99999px;
  padding: 10px 25px 11px;
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1;
  font-weeight: normal;
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDark};
  }
`;

const ButtonWrap = styled(Box)`
  text-align: center;
  margin-right: auto;
  margin-left: auto;
`;

const Title = styled(Heading)`
  font-family: 'wwfregular';
  line-height: 1;
  text-transform: uppercase;
  margin: 5px 0 10px;
  font-weight: 400;
`;

export function CookieConsent({
  init,
  cookieConsent,
  cookieConsentApp,
  onConsent,
  checked,
  navPrivacy,
  show,
}) {
  useInjectSaga({ key: 'consent', saga });
  useInjectReducer({ key: 'consent', reducer });
  useEffect(() => {
    init();
  }, []);

  const consentUnset =
    cookieConsent !== 'true' &&
    cookieConsent !== 'false' &&
    cookieConsentApp !== 'true' &&
    cookieConsentApp !== 'false';
  // console.log('Show cookie consent dialogue: ', checked && consentUnset);
  // console.log('Cookie consent cookie status: ', cookieConsent);
  // console.log('Cookie consent app status: ', cookieConsentApp);
  // console.log('Cookie consent checked: ', checked);
  return (
    <Styled>
      {(show || (checked && consentUnset)) && (
        <Layer
          position="bottom-right"
          plain
          responsive={false}
          modal={false}
          animate={false}
          margin="small"
          style={{ zIndex: 3001 }}
        >
          <Box
            pad={{ top: 'medium', bottom: 'small', horizontal: 'medium' }}
            background="white"
            style={{ maxWidth: '100%', width: '360px' }}
            elevation="large"
            responsive={false}
          >
            <Title level={2}>
              <FormattedMessage {...messages.title} />
            </Title>
            <Paragraph margin={{ bottom: 'medium' }} size="medium">
              <FormattedMessage
                {...messages.info}
                values={{
                  link: (
                    <StyledButtonText
                      alignSelf="end"
                      onClick={() => navPrivacy()}
                      label={
                        <FormattedMessage {...messages.linkPrivacyPolicy} />
                      }
                    />
                  ),
                }}
              />
            </Paragraph>
            <ButtonWrap gap="xsmall" margin={{ bottom: 'medium' }}>
              <StyledButton
                onClick={() => {
                  onConsent('true');
                }}
              >
                <FormattedMessage {...messages.buttonAccept} />
              </StyledButton>
            </ButtonWrap>
          </Box>
        </Layer>
      )}
    </Styled>
  );
}

CookieConsent.propTypes = {
  init: PropTypes.func,
  onConsent: PropTypes.func,
  navPrivacy: PropTypes.func,
  cookieConsent: PropTypes.string,
  cookieConsentApp: PropTypes.string,
  checked: PropTypes.bool,
  show: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  cookieConsent: state => selectCookieConsent(state),
  cookieConsentApp: state => selectCookieConsentApp(state),
  checked: state => selectCookieConsentChecked(state),
  show: state => selectCookieConsentShow(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    init: () => dispatch(checkCookieConsent()),
    onConsent: status => dispatch(setCookieConsent(status)),
    navPrivacy: () => dispatch(navigatePage(PAGES.privacy.path)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CookieConsent));
