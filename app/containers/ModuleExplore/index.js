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
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, ResponsiveContext, Layer } from 'grommet';
import { Layer as LayerIcon } from 'grommet-icons';

// import { loadContent } from 'containers/App/actions';

import PanelExplore from 'containers/PanelExplore';
import ModuleWrap from 'components/ModuleWrap';

import messages from './messages';
// import commonMessages from 'messages';

const Show = styled(props => <Box {...props} />)`
  position: absolute;
  right: 10px;
  top: 10px;
  pointer-events: all;
`;

export function ModuleExplore() {
  const [show, setShow] = useState(true);
  const [showSmall, setShowSmall] = useState(false);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <div>
          <Helmet>
            <title>ModuleExplore</title>
            <meta name="description" content="Description of ModuleExplore" />
          </Helmet>
          <ModuleWrap>
            {show && size !== 'small' && (
              <PanelExplore onClose={() => setShow(false)} />
            )}
            {showSmall && size === 'small' && (
              <Layer full>
                <PanelExplore onClose={() => setShowSmall(false)} />
              </Layer>
            )}
            {(!show || !showSmall) && (
              <Show background="white">
                <Button
                  onClick={() => {
                    setShow(true);
                    setShowSmall(true);
                  }}
                  icon={<LayerIcon />}
                  label={<FormattedMessage {...messages.showLayerPanel} />}
                  plain
                  alignSelf="end"
                  reverse
                />
              </Show>
            )}
          </ModuleWrap>
        </div>
      )}
    </ResponsiveContext.Consumer>
  );
}

// ModuleExplore.propTypes = {
//   layersConfig: PropTypes.array,
//   exploreConfig: PropTypes.array,
// };
//
// const mapStateToProps = createStructuredSelector({
//   layersConfig: state => selectLayersConfig(state),
//   exploreConfig: state => selectExploreConfig(state),
// });
//
// function mapDispatchToProps(dispatch) {
//   return {
//
//   };
// }

// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// );

// export default compose(withConnect)(ModuleExplore);
export default ModuleExplore;
