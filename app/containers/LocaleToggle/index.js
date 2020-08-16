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
import { DropButton, Box } from 'grommet';
import { DropdownDown, DropdownUp } from 'components/Icons';

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
  min-width: 50px;
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
`;

const DropContent = ({ active, options, onSelect, localeLabels, list }) => (
  <Box
    pad="none"
    margin={{ top: 'xxsmall' }}
    background={list ? 'transparent' : 'white'}
    elevation="small"
  >
    {options &&
      options.map(option => (
        <DropOption
          key={option}
          onClick={() => onSelect(option)}
          active={active === option}
          disabled={active === option}
          list={list}
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
  list: PropTypes.bool,
};

export function LocaleToggle({ locale, onLocaleToggle, list }) {
  const [open, setOpen] = useState(false);
  return (
    <Styled fill="vertical">
      {!list && (
        <StyledDropButton
          plain
          reverse
          gap="xxsmall"
          active={open}
          fill="vertical"
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          dropProps={{
            align: { top: 'bottom', right: 'right' },
            plain: true,
          }}
          icon={
            open ? <DropdownUp color="white" /> : <DropdownDown color="white" />
          }
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
      {list && (
        <DropContent
          active={locale}
          options={appLocales}
          onSelect={onLocaleToggle}
          localeLabels={appLocaleLabels}
          list
        />
      )}
    </Styled>
  );
}

LocaleToggle.propTypes = {
  onLocaleToggle: PropTypes.func,
  locale: PropTypes.string,
  list: PropTypes.bool,
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
