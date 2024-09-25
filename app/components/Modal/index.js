/**
 *
 * Modal
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
// import { Box, Button, ResponsiveContext } from 'grommet';
import { Box } from 'grommet';

const Background = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  overflow-y: auto;
  z-index: ${({ zIndex }) => zIndex || 2600};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

const TheModal = styled(p => (
  <Box
    flex={{ shrink: 0 }}
    pad="ml"
    background="white"
    elevation="large"
    {...p}
  />
))`
  position: relative;
  margin: 0 auto;
  width: 100%;
  cursor: default;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    margin: 40px auto;
    width: 90%;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
    width: ${({ theme }) => theme.dimensions.modal.width[3]}px;
  }
  @media (min-width: ${({ theme }) => theme.sizes.xxlarge.minpx}) {
    width: ${({ theme }) => theme.dimensions.modal.width[4]}px;
  }
`;

export function Modal({ content, onClose, zIndex }) {
  return (
    <Background onClick={onClose} zIndex={zIndex}>
      <TheModal
        onClick={e => {
          if (e) e.stopPropagation();
        }}
        className="mpx-modal"
      >
        {content}
      </TheModal>
    </Background>
  );
}
// </ResponsiveContext.Consumer>

Modal.propTypes = {
  onClose: PropTypes.func,
  zIndex: PropTypes.number,
  content: PropTypes.node,
};

export default Modal;
// export default ModuleExplore;
