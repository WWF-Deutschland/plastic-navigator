import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { Button, Box, ResponsiveContext, Layer } from 'grommet';
import { Menu } from 'grommet-icons';

import { selectRouterPath } from 'containers/App/selectors';
import { navigate, navigatePage } from 'containers/App/actions';
import { MODULES, PAGES } from 'config';

import LocaleToggle from 'containers/LocaleToggle';

import { getHeaderHeight, isMinSize, isMaxSize } from 'utils/responsive';

import commonMessages from 'messages';

import NavBar from './NavBar';

const MenuButton = styled(props => <Button plain {...props} fill="vertical" />)`
  width: ${getHeaderHeight('small')}px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: ${getHeaderHeight('medium')}px;
  }
  text-align: center;
`;

const MenuOpen = styled(Menu)`
  transform: rotate(90deg);
`;

const NavSecondary = styled(props => (
  <Box {...props} direction="row" gap="small" align="center" fill="vertical" />
))``;
const NavPrimary = styled(props => (
  <Box {...props} direction="row" align="center" fill="vertical" />
))``;

// prettier-ignore
const Primary = styled(props => <Button {...props} plain fill="vertical" />)`
  font-family: 'wwfregular';
  letter-spacing: 0.05em;
  padding: ${({ theme }) => theme.global.edgeSize.small} ${({ theme }) => theme.global.edgeSize.medium};
  color: ${({ theme }) => theme.global.colors.white};
  opacity: 1;
  text-decoration: ${({ active }) => (active ? 'underline' : 'none')};
  text-transform: uppercase;
  background: ${({ theme, active }) =>
    active ? theme.global.colors.brandDark : 'transparent'};
  &:hover {
    text-decoration: underline;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  }
  border-right: 1px solid;
  border-left: 1px solid;
  border-color: ${({ theme }) => theme.global.colors.brandDark};
`;
// prettier-ignore
const Secondary = styled(props => <Button {...props} plain />)`
  font-family: 'wwfregular';
  letter-spacing: 0.05em;
  padding: ${({ theme }) => theme.global.edgeSize.small} ${({ theme }) => theme.global.edgeSize.medium};
  color: ${({ theme }) => theme.global.colors.white};
  text-decoration: ${({ active }) => (active ? 'underline' : 'none')};
  background: transparent;
  &:hover {
    text-decoration: underline;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    padding: 0 ${({ theme }) => theme.global.edgeSize.small};
    padding-right: ${({ theme, last }) =>
    last ? 0 : theme.global.edgeSize.small};
  }
`;

const toArray = obj =>
  Object.keys(obj).map(key => ({
    key,
    ...obj[key],
  }));

function Header({ nav, navPage, path }) {
  const [showMenu, setShowMenu] = useState(false);

  const paths = path.split('/');
  const route = path[0] === '/' ? paths[2] : paths[1];
  const pagesArray = toArray(PAGES);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <NavBar
            justify={isMinSize(size, 'large') ? 'start' : 'between'}
            alignContent="end"
          >
            <NavPrimary>
              {toArray(MODULES).map((m, index) => (
                <Primary
                  key={m.key}
                  onClick={() => {
                    setShowMenu(false);
                    nav(m.path);
                  }}
                  label={
                    isMinSize(size, 'medium') ? (
                      <FormattedMessage
                        {...commonMessages[`module_${m.key}`]}
                      />
                    ) : (
                      ''
                    )
                  }
                  active={route === m.path}
                  disabled={route === m.path}
                  last={index === Object.keys(PAGES).length - 1}
                  icon={m.icon}
                />
              ))}
            </NavPrimary>
            {isMaxSize(size, 'medium') && (
              <MenuButton
                plai
                onClick={() => setShowMenu(!showMenu)}
                label={
                  showMenu ? <MenuOpen color="white" /> : <Menu color="white" />
                }
              />
            )}
            {isMinSize(size, 'large') && (
              <Box
                fill="vertical"
                pad={{ horizontal: 'small' }}
                margin={{ left: 'auto' }}
              >
                <NavSecondary justify="end">
                  {pagesArray.map((p, index) => (
                    <Secondary
                      key={p.key}
                      onClick={() => navPage(p.key)}
                      label={
                        <FormattedMessage
                          {...commonMessages[`page_${p.key}`]}
                        />
                      }
                      last={index === Object.keys(PAGES).length - 1}
                    />
                  ))}
                  <LocaleToggle />
                </NavSecondary>
              </Box>
            )}
          </NavBar>
          {isMaxSize(size, 'medium') && showMenu && (
            <Layer
              full="horizontal"
              margin={{ top: '52px' }}
              onClickOutside={() => setShowMenu(false)}
              responsive={false}
              modal={false}
              animate={false}
              background="black"
              position="top"
              style={{ zIndex: 3000 }}
            >
              <Box background="black">
                {pagesArray.map(p => (
                  <Secondary
                    key={p.key}
                    onClick={() => {
                      setShowMenu(false);
                      navPage(p.key);
                    }}
                    label={
                      <FormattedMessage {...commonMessages[`page_${p.key}`]} />
                    }
                  />
                ))}
                <LocaleToggle />
              </Box>
            </Layer>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
}

Header.propTypes = {
  nav: PropTypes.func,
  navPage: PropTypes.func,
  path: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  path: state => selectRouterPath(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    nav: path => dispatch(navigate(path, { deleteSearchParams: ['info'] })),
    navPage: id => dispatch(navigatePage(id)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
