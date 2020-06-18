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
  right: 20px;
  top: 20px;
  pointer-events: all;
`;

const ShowButton = styled(p => <Button plain reverse {...p} />)`
  background: ${({ theme }) => theme.global.colors.black};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 20px;
  padding: 5px 15px;
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
            {((!show && size !== 'small') ||
              (!showSmall && size === 'small')) && (
              <Show>
                <ShowButton
                  onClick={() => {
                    setShow(true);
                    setShowSmall(true);
                  }}
                  icon={<LayerIcon color="white" />}
                  label={<FormattedMessage {...messages.showLayerPanel} />}
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
