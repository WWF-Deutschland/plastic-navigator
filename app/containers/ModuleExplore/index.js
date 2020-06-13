/**
 *
 * ModuleExplore
 *
 */

import React, { useState } from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
import { Helmet } from 'react-helmet';
// import { compose } from 'redux';
import styled from 'styled-components';
import { Box, Button } from 'grommet';
import { Close, Layer } from 'grommet-icons';

import ModuleWrap from 'components/ModuleWrap';
// import { selectContentByKey } from 'containers/App/selectors';
// import { loadContent } from 'containers/App/actions';

// import messages from './messages';
// import commonMessages from 'messages';

const ExplorePanel = styled(props => <Box {...props} />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  pointer-events: all;
`;
const Show = styled(props => <Box {...props} />)`
  position: absolute;
  right: 10px;
  top: 10px;
  pointer-events: all;
`;

export function ModuleExplore() {
  const [show, setShow] = useState(true);
  return (
    <div>
      <Helmet>
        <title>ModuleExplore</title>
        <meta name="description" content="Description of ModuleExplore" />
      </Helmet>
      <ModuleWrap>
        {show && (
          <ExplorePanel background="white">
            <Button
              onClick={() => setShow(false)}
              icon={<Close />}
              plain
              alignSelf="end"
            />
            Hello
          </ExplorePanel>
        )}
        {!show && (
          <Show background="white">
            <Button
              onClick={() => setShow(true)}
              icon={<Layer />}
              plain
              alignSelf="end"
            />
          </Show>
        )}
      </ModuleWrap>
    </div>
  );
}

ModuleExplore.propTypes = {};

// const mapStateToProps = createStructuredSelector({});

// function mapDispatchToProps(dispatch) {
//   return {};
// }

// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// );

// export default compose(withConnect)(ModuleExplore);
export default ModuleExplore;
