/**
 *
 * PanelExplore
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
// import { connect } from 'react-redux';
// import { compose } from 'redux';
// import { createStructuredSelector } from 'reselect';
import { Box, Button, Text, ResponsiveContext } from 'grommet';
import { Close, ExploreS as Layer } from 'components/Icons';
import { getAsideWidth } from 'utils/responsive';

import messages from './messages';
// import commonMessages from 'messages';

const Styled = styled(props => <Box {...props} elevation="medium" />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  pointer-events: all;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    width: ${({ panelWidth }) => panelWidth || 400}px;
  }
`;

const PanelHeader = styled(p => (
  <Box
    background="brand"
    justify="between"
    {...p}
    elevation="small"
    responsive={false}
  />
))`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 140px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    height: 150px;
  }
`;
const PanelBody = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 150px;
  width: 100%;
  bottom: 0;
  padding: 12px 12px 96px;
  overflow-y: scroll;
`;
const TitleWrap = styled(p => (
  <Box margin={{ top: 'medium' }} {...p} align="center" responsive={false} />
))``;
const Title = styled(Text)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
`;

const ButtonClose = styled(p => (
  <Button icon={<Close />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 10px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.brandDark};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDarker};
  }
`;

export function PanelFeaturedLayer({ onClose, config }) {
  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideWidth(size)}>
          <div>
            <PanelHeader>
              <ButtonClose onClick={() => onClose()} />
              <TitleWrap>
                <Layer />
                <Title>
                  <FormattedMessage {...messages.title} />
                </Title>
              </TitleWrap>
            </PanelHeader>
            <PanelBody>
              {config.featuredLayer}
            </PanelBody>
          </div>
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

PanelFeaturedLayer.propTypes = {
  onClose: PropTypes.func,
  config: PropTypes.object,
  // locale: PropTypes.string,
};

// const mapStateToProps = createStructuredSelector({
//   info: state => selectInfoSearch(state),
// });

// export function mapDispatchToProps(dispatch) {
//   return {
//     onCloseLayerInfo: () => dispatch(setLayerInfo()),
//   };
// }

// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// );

// export default compose(withConnect)(PanelFeaturedLayer);
export default PanelFeaturedLayer;
