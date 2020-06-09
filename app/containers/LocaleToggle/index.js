/*
 *
 * LanguageToggle
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setLocale } from 'containers/App/actions';
import { selectLocale } from 'containers/App/selectors';
import Toggle from 'components/Toggle';
import { appLocales } from 'i18n';
import Wrapper from './Wrapper';
import messages from './messages';

export function LocaleToggle(props) {
  return appLocales.length < 2 ? null : (
    <Wrapper>
      <Toggle
        value={props.locale}
        values={appLocales}
        messages={messages}
        onToggle={props.onLocaleToggle}
      />
    </Wrapper>
  );
}

LocaleToggle.propTypes = {
  onLocaleToggle: PropTypes.func,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLocaleToggle: evt => dispatch(setLocale(evt.target.value)),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LocaleToggle);
