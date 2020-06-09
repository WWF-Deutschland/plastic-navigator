import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { Button, Box, ResponsiveContext, Layer } from 'grommet';
import { Menu } from 'grommet-icons';

import { selectRouterPath } from 'containers/App/selectors';
import { navigate, navigateHome, navigatePage } from 'containers/App/actions';
import { PAGES } from 'config';

import LocaleToggle from 'containers/LocaleToggle';

import { getHeaderHeight, isMinSize, isMaxSize } from 'utils/responsive';

import commonMessages from 'messages';

import NavBar from './NavBar';

const Brand = styled(props => <Button {...props} plain color="white" />)`
  /* responsive height */
  padding: 0 ${({ theme }) => theme.global.edgeSize.xsmall};
  height: ${getHeaderHeight('small')}px;
  font-weight: 600;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: ${getHeaderHeight('medium')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    height: ${getHeaderHeight('large')}px;
    min-width: ${getHeaderHeight('large')}px;
    max-width: ${getHeaderHeight('large') + 20}px;
    margin-right: ${getHeaderHeight('large')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    height: ${getHeaderHeight('xlarge')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    height: ${getHeaderHeight('xxlarge')}px;
  }
  &:hover {
    background: ${({ theme }) => theme.global.colors.brand};
  }
`;

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
  <Box {...props} direction="row" gap="small" basis="1/2" />
))``;

// prettier-ignore
const Secondary = styled(props => <Button {...props} plain />)`
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

const pagesArray = Object.keys(PAGES).map(key => ({
  key,
  ...PAGES[key],
}));

function Header({ nav, navHome, navPage, path }) {
  const [showMenu, setShowMenu] = useState(false);

  const paths = path.split('/');
  const contentType = paths[0] === '' ? paths[1] : paths[0];
  const contentId =
    paths[0] === ''
      ? paths.length > 1 && paths[2]
      : paths.length > 0 && paths[1];

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <NavBar
            justify={isMinSize(size, 'large') ? 'start' : 'between'}
            alignContent="end"
          >
            <Brand
              onClick={() => navHome()}
              label={<FormattedMessage {...commonMessages.appTitle} />}
            />
            {isMaxSize(size, 'medium') && (
              <MenuButton
                plain
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
                      active={contentType === 'page' && contentId === p.key}
                      last={index === pagesArray.length - 1}
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
            >
              <Box background="black">
                <Secondary
                  onClick={() => {
                    setShowMenu(false);
                    nav('explore');
                  }}
                  label={<FormattedMessage {...commonMessages.navExplore} />}
                  active={contentType === 'explore'}
                />
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
                    active={contentType === 'page' && contentId === p.key}
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
  navHome: PropTypes.func,
  navPage: PropTypes.func,
  path: PropTypes.string,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  path: state => selectRouterPath(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    nav: path => dispatch(navigate(path)),
    navHome: () => dispatch(navigateHome()),
    navPage: id => dispatch(navigatePage(id)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Header));
