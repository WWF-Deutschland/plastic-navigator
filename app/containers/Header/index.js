import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';

import { Button, Box, ResponsiveContext } from 'grommet';
import { WWFLogoHeader, Menu } from 'components/Icons';

import { selectRouterPath, selectIFrameSearch } from 'containers/App/selectors';
import { navigate, navigatePage, navigateHome } from 'containers/App/actions';

import LocaleToggle from 'containers/LocaleToggle';

import { isMinSize, isMaxSize } from 'utils/responsive';

import { MODULES, PAGES, LOCALE_TOGGLE } from 'config';
import commonMessages from 'messages';

import NavBar from './NavBar';
import MenuLayer from './MenuLayer';

const MenuButton = styled(props => <Button plain {...props} fill="vertical" />)`
  text-align: center;
  background: black !important;
  width: 28px;
  min-width: 28px;
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
  text-decoration: none;
  text-transform: uppercase;
  font-size: 20px;
  line-height: 1;
  opacity: 1;
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'black' : 'white']};
  background: ${({ theme, active }) =>
    active ? theme.global.colors.light : 'transparent'};
  border-right: 1px solid;
  border-left: 1px solid;
  border-color: ${({ theme }) => theme.global.colors.dark};
  &:hover {
    background: ${({ active, theme }) => theme.global.colors[active ? 'light' : 'dark']};
  }
  width: 40px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: auto;
    min-width: 120px;
    padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    min-width: 140px;
    padding: 0 ${({ theme }) => theme.global.edgeSize.ms};
  }
`;
// prettier-ignore
const Secondary = styled(props => <Button {...props} plain />)`
  font-size: ${({ theme }) => theme.text.medium.size};
  padding: ${({ theme }) => theme.global.edgeSize.small};
  color: ${({ theme }) => theme.global.colors.white};
  background: transparent;
  &:hover {
    text-decoration: underline;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    text-transform: uppercase;
    font-size: 20px;
    font-family: 'wwfregular';
    line-height: 1;
    padding: 0 ${({ theme }) => theme.global.edgeSize.small};
    padding-right: ${({ theme, last }) =>
    last ? 0 : theme.global.edgeSize.small};
  }
`;

const Brand = styled(props => <Button {...props} plain fill="vertical" />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  z-index: 3000;
  max-width: 85px;
  color: ${({ theme }) => theme.global.colors.white};
  font-size: 16px;
  line-height: 1;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding-right: ${({ theme }) => theme.global.edgeSize.xsmall};
    max-width: 120px;
    font-size: 20px;
  }
`;
const BrandWWFWrap = styled(props => <Box {...props} />)`
  position: relative;
  width: 50px;
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    width: 72px;
  }
`;
const BrandWWF = styled(props => <Button {...props} plain />)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3000;
  height: 58px;
  width: 50px;
  background: ${({ theme }) => theme.global.colors.white};
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    height: 81px;
    width: 72px;
  }
`;

const toArray = obj =>
  Object.keys(obj).map(key => ({
    key,
    ...obj[key],
  }));

function Header({ nav, navPage, path, navHome, intl, iframeConfig }) {
  const [showMenu, setShowMenu] = useState(false);

  const paths = path.split('/');
  const route = path[0] === '/' ? paths[2] : paths[1];
  const pagesArray = toArray(PAGES).filter(p => p.header);

  // Logo should show
  // or if iframe not wwf iframe: !window.wwfMpxInsideIframe
  const showLogo = !window.wwfMpxInsideWWFIframe;
  const showNavPrimary = iframeConfig !== 'config1';
  const showLangOptions = LOCALE_TOGGLE && iframeConfig !== 'config1';
  // const showNavPrimary =
  //   iframeConfig !== 'config1' || !window.wwfMpxInsideIframe;
  // const showLangOptions =
  //   LOCALE_TOGGLE && (iframeConfig !== 'config1' || !window.wwfMpxInsideIframe);
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <NavBar
            justify={isMinSize(size, 'large') ? 'start' : 'between'}
            alignContent="end"
            responsive={false}
            pad={
              isMinSize(size, 'large')
                ? { horizontal: 'medium' }
                : { horizontal: 'xsmall' }
            }
            gap="none"
          >
            <Box
              direction="row"
              fill
              gap="small"
              justify={isMinSize(size, 'medium') ? 'start' : 'between'}
            >
              {showLogo && (
                <BrandWWFWrap>
                  <BrandWWF
                    as="a"
                    target="_blank"
                    href={intl.formatMessage(commonMessages.brandLink)}
                    title={intl.formatMessage(commonMessages.brandLinkTitle)}
                  >
                    <WWFLogoHeader
                      color="black"
                      size={isMaxSize(size, 'medium') ? '50px' : '72px'}
                    />
                  </BrandWWF>
                </BrandWWFWrap>
              )}
              <Brand
                onClick={() => navHome()}
                label={<FormattedMessage {...commonMessages.appTitle} />}
              />
              {showNavPrimary && (
                <NavPrimary
                  margin={{
                    left: isMaxSize(size, 'small') ? 'auto' : '0',
                    right: isMaxSize(size, 'small') ? 'small' : '0',
                  }}
                >
                  {toArray(MODULES).map(m => (
                    <Primary
                      key={m.key}
                      onClick={() => {
                        setShowMenu(false);
                        nav(m.path);
                      }}
                      active={route === m.path}
                      disabled={route === m.path}
                    >
                      <Box
                        direction="row"
                        justify={isMinSize(size, 'medium') ? 'start' : 'center'}
                        align="center"
                        gap="ms"
                      >
                        {isMinSize(size, 'large') && (
                          <>{route === m.path ? m.iconActive : m.icon}</>
                        )}
                        {isMaxSize(size, 'medium') && (
                          <>{route === m.path ? m.iconActiveS : m.iconS}</>
                        )}
                        {isMinSize(size, 'medium') && (
                          <FormattedMessage
                            {...commonMessages[`module_${m.key}`]}
                          />
                        )}
                      </Box>
                    </Primary>
                  ))}
                </NavPrimary>
              )}
            </Box>
            {isMinSize(size, 'medium') && (
              <Box
                fill="vertical"
                flex={{ grow: 1 }}
                pad={{ left: 'small' }}
                margin={{ left: 'auto' }}
              >
                <NavSecondary justify="end">
                  {isMinSize(size, 'large') &&
                    pagesArray.map((p, index) => (
                      <Secondary
                        key={p.key}
                        fill="vertical"
                        onClick={() => navPage(p.key)}
                        label={
                          <FormattedMessage
                            {...commonMessages[`page_${p.key}`]}
                          />
                        }
                        last={index === Object.keys(PAGES).length - 1}
                      />
                    ))}
                  {showLangOptions && <LocaleToggle />}
                </NavSecondary>
              </Box>
            )}
            {isMaxSize(size, 'medium') && (
              <MenuButton
                plain
                onClick={() => setShowMenu(true)}
                active={showMenu}
                label={<Menu color="white" />}
              />
            )}
            {isMaxSize(size, 'medium') && showMenu && (
              <MenuLayer
                onClose={() => setShowMenu(false)}
                navPage={key => navPage(key)}
                nav={modulePath => nav(modulePath)}
                route={route}
                modulesArray={toArray(MODULES)}
                pagesArray={pagesArray}
              />
            )}
          </NavBar>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
}

Header.propTypes = {
  nav: PropTypes.func,
  navPage: PropTypes.func,
  navHome: PropTypes.func,
  path: PropTypes.string,
  iframeConfig: PropTypes.string,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  path: state => selectRouterPath(state),
  iframeConfig: state => selectIFrameSearch(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    nav: path => dispatch(navigate(path, { deleteSearchParams: ['info'] })),
    navPage: id => dispatch(navigatePage(id)),
    navHome: () => dispatch(navigateHome()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Header));
