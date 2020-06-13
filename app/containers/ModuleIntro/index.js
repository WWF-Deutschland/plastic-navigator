/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
// import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
// import { connect } from 'react-redux';
// import { compose } from 'redux';
// import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

// import commonMessages from 'messages';
// import messages from './messages';

const Styled = styled.div``;

const MainContent = styled.div`
  position: relative;
`;

export function ModuleIntro() {
  return (
    <Styled>
      <Helmet>
        <title>Home Page</title>
        <meta name="description" content="home" />
      </Helmet>
      <MainContent />
    </Styled>
  );
}

// HomePage.propTypes = {};
//
// const mapStateToProps = createStructuredSelector({
//   locale: state => selectLocale(state),
// });
//
// export function mapDispatchToProps(dispatch) {
//   return {
//     navPage: id => dispatch(navigatePage(id)),
//   };
// }

// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// );

export default ModuleIntro;
