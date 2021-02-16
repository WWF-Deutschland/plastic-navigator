/**
 *
 * PanelTransfers
 *
 */

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  Box,
  // Heading,
  // Paragraph,
  ResponsiveContext,
} from 'grommet';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { getAsideTransferWidth } from 'utils/responsive';
import quasiEquals from 'utils/quasi-equals';

import { ExploreS as LayerIcon } from 'components/Icons';
import Tabs from 'components/Tabs';
import TabLink from 'components/TabLink';
import TabLinkWrapper from 'components/TabLinkWrapper';
import TabLinkAnchor from 'components/TabLinkAnchor';
import PanelHeader from 'components/PanelHeader';
import PanelTitle from 'components/PanelTitle';
import PanelTitleWrap from 'components/PanelTitleWrap';
import PanelBody from 'components/PanelBody';
import ButtonPanelClose from 'components/ButtonPanelClose';

// import { DEFAULT_LOCALE } from 'i18n';
import Analysis from './Analysis';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import { setAnalysis, setDirection, setNode } from './actions';
import { selectAnalysis, selectDirection, selectNode } from './selectors';
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

export function PanelTransfers({
  onClose,
  // layersConfig,
  // locale,
  analysesConfig,
  activeAnalysis,
  onSetAnalysis,
  direction,
  onSetDirection,
  onSetNode,
  node,
}) {
  useInjectReducer({ key: 'panelTransfers', reducer });
  useInjectSaga({ key: 'panelTransfers', saga });

  const cRef = useRef();
  useEffect(() => {
    cRef.current.scrollTop = 0;
  }, [activeAnalysis]);

  useEffect(() => {
    if (!activeAnalysis) {
      onSetAnalysis('gyres');
    } else if (activeAnalysis === 'gyres') {
      onSetDirection('to');
    } else {
      onSetDirection('from');
    }
  }, [activeAnalysis]);
  useEffect(() => {
    if (activeAnalysis === 'gyres') {
      onSetNode('');
    }
  }, [direction]);

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideTransferWidth(size)}>
          <PanelHeader>
            <ButtonPanelClose onClick={() => onClose()} />
            <PanelTitleWrap>
              <LayerIcon />
              <PanelTitle>
                <FormattedMessage {...messages.title} />
              </PanelTitle>
            </PanelTitleWrap>
            <Tabs>
              {analysesConfig && analysesConfig.map(({ id }) => (
                <TabLinkWrapper key={id}>
                  <TabLink
                    onClick={() => onSetAnalysis(id)}
                    active={activeAnalysis === id}
                    disabled={activeAnalysis === id}
                    label={
                      <TabLinkAnchor active={activeAnalysis === id}>
                        <FormattedMessage {...messages[`mode_${id}`]} />
                      </TabLinkAnchor>
                    }
                  />
                </TabLinkWrapper>
              ))}
            </Tabs>
          </PanelHeader>
          <PanelBody ref={cRef}>
            {activeAnalysis && analysesConfig && (
              <Analysis
                id={activeAnalysis}
                direction={direction}
                onSetDirection={onSetDirection}
                node={node}
                onSetNode={onSetNode}
                analysisConfig={analysesConfig.find(
                  ({ id }) => quasiEquals(id, activeAnalysis),
                )}
              />
            )}
          </PanelBody>
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

PanelTransfers.propTypes = {
  onClose: PropTypes.func,
  onSetAnalysis: PropTypes.func,
  onSetDirection: PropTypes.func,
  onSetNode: PropTypes.func,
  // layersConfig: PropTypes.array,
  // locale: PropTypes.string,
  analysesConfig: PropTypes.array,
  activeAnalysis: PropTypes.string,
  direction: PropTypes.string,
  node: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  // layersConfig: state => selectLayersConfig(state),
  // locale: state => selectLocale(state),
  activeAnalysis: state => selectAnalysis(state),
  direction: state => selectDirection(state),
  node: state => selectNode(state),
  // activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetAnalysis: id => dispatch(setAnalysis(id)),
    onSetDirection: dir => dispatch(setDirection(dir)),
    onSetNode: node => dispatch(setNode(node)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelTransfers);
// export default PanelTransfers;
