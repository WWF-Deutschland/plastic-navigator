/*
 *
 * LanguageToggle
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import { DropButton, Box, ResponsiveContext } from 'grommet';
import { FormDown, FormUp } from 'grommet-icons';

import { appLocales, appLocaleLabels } from 'i18n';

import { setLocale } from 'containers/App/actions';
import { selectLocale } from 'containers/App/selectors';

import DropOption from './DropOption';
const Styled = styled(Box)``;
// prettier-ignore
const StyledDropButton = styled(DropButton)`
  font-family: 'wwfregular';
  font-size: ${({ theme }) => theme.text.large.size};
  letter-spacing: 0.05em;
  text-decoration: none;
  text-transform: uppercase;
  padding: 0 0 0 6px;
  color: ${({ theme }) => theme.global.colors.white} !important;
  background: transparent;
  vertical-align: middle;
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
`;

const DropContent = ({ active, options, onSelect, localeLabels }) => (
  <Box
    pad="none"
    margin={{ top: 'xxsmall' }}
    background="white"
    elevation="small"
  >
    {options &&
      options.map(option => (
        <DropOption
          key={option}
          onClick={() => onSelect(option)}
          active={active === option}
          disabled={active === option}
        >
          {(localeLabels && localeLabels[option]) || option}
        </DropOption>
      ))}
  </Box>
);
DropContent.propTypes = {
  onSelect: PropTypes.func,
  active: PropTypes.string,
  options: PropTypes.array,
  localeLabels: PropTypes.array,
};

export function LocaleToggle({ locale, onLocaleToggle, light }) {
  const [open, setOpen] = useState(false);
  return (
    <Styled fill="vertical">
      <ResponsiveContext.Consumer>
        {() => (
          <StyledDropButton
            plain
            reverse
            light={light}
            gap="xxsmall"
            active={open}
            fill="vertical"
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            dropProps={{
              align: { top: 'bottom', right: 'right' },
              plain: true,
            }}
            icon={open ? <FormUp color="white" /> : <FormDown color="white" />}
            label={locale}
            dropContent={
              <DropContent
                active={locale}
                options={appLocales}
                onSelect={onLocaleToggle}
                localeLabels={appLocaleLabels}
              />
            }
          />
        )}
      </ResponsiveContext.Consumer>
    </Styled>
  );
}

LocaleToggle.propTypes = {
  onLocaleToggle: PropTypes.func,
  locale: PropTypes.string,
  light: PropTypes.bool,
};

const mapStateToProps = state => ({
  locale: selectLocale(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLocaleToggle: locale => dispatch(setLocale(locale)),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(LocaleToggle));
