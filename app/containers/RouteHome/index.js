/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { memo, useRef } from 'react';
// import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import { selectLocale } from 'containers/App/selectors';
import { navigatePage } from 'containers/App/actions';

import Footer from 'components/Footer';

import { getHeaderHeight } from 'utils/responsive';

// import commonMessages from 'messages';
// import messages from './messages';

const Styled = styled.div``;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  top: 100vh;
  margin-top: -${getHeaderHeight('small')}px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    margin-top: -${getHeaderHeight('medium')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.large.minpx}) {
    margin-top: -${getHeaderHeight('large')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    margin-top: -${getHeaderHeight('xlarge')}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    margin-top: -${getHeaderHeight('xxlarge')}px;
  }
`;

export function HomePage() {
  const targetRef = useRef(null);
  return (
    <Styled>
      <Helmet>
        <title>Home Page</title>
        <meta name="description" content="home" />
      </Helmet>
      <MainContent ref={targetRef}>
        Hello World
        <Footer />
      </MainContent>
    </Styled>
  );
}

// HomePage.propTypes = {};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    navPage: id => dispatch(navigatePage(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
