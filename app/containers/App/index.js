/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
// import { injectIntl, intlShape } from 'react-intl';
import { Helmet } from 'react-helmet';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import appTheme from 'theme';
import { Grommet, Button } from 'grommet';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import { getHeaderHeight } from 'utils/responsive';

import reducer from 'containers/App/reducer';
import saga from 'containers/App/saga';
import { loadConfig, navigateHome, navigate } from 'containers/App/actions';
import { selectRouterPath, selectPageSearch } from 'containers/App/selectors';

import ModuleIntro from 'containers/ModuleIntro/Loadable';
import ModuleExplore from 'containers/ModuleExplore/Loadable';
import Header from 'containers/Header';
import Map from 'containers/Map';
import Page from 'containers/Page';

import { ROUTES, CONFIG } from 'config';
import GlobalStyle from 'global-styles';
import { appLocales, DEFAULT_LOCALE } from 'i18n';

import commonMessages from 'messages';

const AppWrapper = styled.div`
  width: 100%;
  min-height: 100%;
`;

const Content = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  top: ${getHeaderHeight('small')}px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    top: ${getHeaderHeight('medium')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    top: ${getHeaderHeight('large')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    top: ${getHeaderHeight('xlarge')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    top: ${getHeaderHeight('xxlarge')}px;
  }
`;

const Brand = styled(props => <Button {...props} plain color="white" />)`
  position: absolute;
  z-index: 3000;
  top: 100px;
  left: 0;
  max-width: 140px;
  padding: 0 ${({ theme }) => theme.global.edgeSize.xsmall};
  font-weight: 600;
  color: ${({ route, theme }) =>
    theme.global.colors[route !== ROUTES.INTRO ? 'white' : 'black']};
  background: ${({ route, theme }) =>
    theme.global.colors[route === ROUTES.INTRO ? 'white' : 'black']};
`;

function App({ onLoadConfig, navHome, path, page, onClosePage }) {
  useInjectReducer({ key: 'global', reducer });
  useInjectSaga({ key: 'default', saga });
  useEffect(() => {
    onLoadConfig();
  }, []);

  // figure out route for Brand element colours
  const route = path.split('/')[path[0] === '/' ? 1 : 0];

  return (
    <Grommet theme={appTheme}>
      <AppWrapper>
        <Helmet
          titleTemplate="%s - Marine Plastic Explorer"
          defaultTitle="Marine Plastic Explorer"
        >
          <meta name="description" content="" />
        </Helmet>
        <Header route={route} />
        <Content>
          <Map />
          <Switch>
            <Route
              exact
              path={`/:locale(${appLocales.join('|')})/${ROUTES.INTRO}/`}
              component={ModuleIntro}
            />
            <Route
              path={`/:locale(${appLocales.join('|')})/${ROUTES.EXPLORE}/`}
              component={ModuleExplore}
            />
            <Redirect to={`/${DEFAULT_LOCALE}/${ROUTES.INTRO}/`} />
          </Switch>
          {page !== '' && <Page page={page} onClose={() => onClosePage()} />}
          <Brand
            onClick={() => navHome()}
            label={<FormattedMessage {...commonMessages.appTitle} />}
            route={route}
          />
        </Content>
        <GlobalStyle />
      </AppWrapper>
    </Grommet>
  );
}

App.propTypes = {
  navHome: PropTypes.func,
  onLoadConfig: PropTypes.func,
  onClosePage: PropTypes.func,
  path: PropTypes.string,
  page: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  path: state => selectRouterPath(state),
  page: state => selectPageSearch(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadConfig: () => {
      Object.keys(CONFIG).forEach(key => {
        dispatch(loadConfig(key));
      });
    },
    onClosePage: () =>
      dispatch(
        navigate(null, {
          deleteSearchParams: ['page'],
        }),
      ),
    navHome: () => dispatch(navigateHome()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(App);
