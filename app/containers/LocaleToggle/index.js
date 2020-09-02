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
import { DropButton, Box, Button } from 'grommet';
import { DropdownDown, DropdownUp } from 'components/Icons';

import { appLocales, appLocaleLabels } from 'i18n';

import { setLocale } from 'containers/App/actions';
import { selectLocale } from 'containers/App/selectors';

import DropOption from './DropOption';
const Styled = styled(Box)``;
// prettier-ignore
const StyledDropButton = styled(DropButton)`
  text-transform: uppercase;
  font-size: 20px;
  font-family: 'wwfregular';
  line-height: 1;
  text-decoration: none;
  padding: 0 0 0 6px;
  color: ${({ theme }) => theme.global.colors.white} !important;
  background: transparent;
  vertical-align: middle;
  min-width: 50px;
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
`;

const ListItem = styled(props => <Button {...props} plain fill="horizontal" />)`
  padding: ${({ theme }) => theme.global.edgeSize.small} 0;
  color: ${({ theme }) => theme.global.colors.white} !important;
  background: transparent;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.global.colors.dark};
  opacity: 1;
  &:last-child {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.global.colors.dark};
  }
  font-weight: ${({ active }) => (active ? 600 : 400)};
`;

const DropContent = ({ active, options, onSelect, localeLabels, list }) => (
  <Box
    pad="none"
    margin={{ top: 'hair' }}
    background={list ? 'transparent' : 'white'}
    elevation={list ? 'none' : 'small'}
  >
    {!list &&
      options &&
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
    {list &&
      options &&
      options.map(option => (
        <ListItem
          key={option}
          onClick={() => onSelect(option)}
          active={active === option}
          disabled={active === option}
        >
          {(localeLabels && localeLabels[option]) || option}
        </ListItem>
      ))}
  </Box>
);
DropContent.propTypes = {
  onSelect: PropTypes.func,
  active: PropTypes.string,
  options: PropTypes.array,
  localeLabels: PropTypes.object,
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
