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
import { ExploreS as Layer } from 'components/Icons';
import { getAsideWidth } from 'utils/responsive';

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

import {
  // selectLayersConfig,
  // selectLocale,
  selectUIStateByKey,
} from 'containers/App/selectors';
import { setUIState } from 'containers/App/actions';

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

const COMPONENT_KEY = 'PanelTransfers';

const DEFAULT_UI_STATE = {
  tab: 'gyres',
};

export function PanelTransfers({
  onClose,
  onSetTab,
  // layersConfig,
  // locale,
  uiState,
}) {
  const { tab } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;

  const cRef = useRef();
  useEffect(() => {
    cRef.current.scrollTop = 0;
  }, [uiState]);

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled background="white" panelWidth={getAsideWidth(size)}>
          <div>
            <PanelHeader>
              <ButtonPanelClose onClick={() => onClose()} />
              <PanelTitleWrap>
                <Layer />
                <PanelTitle>
                  <FormattedMessage {...messages.title} />
                </PanelTitle>
              </PanelTitleWrap>
              <Tabs>
                <TabLinkWrapper>
                  <TabLink
                    onClick={() => onSetTab('gyres', uiState)}
                    active={tab === 'gyres'}
                    disabled={tab === 'gyres'}
                    label={
                      <TabLinkAnchor active={tab === 'gyres'}>
                        <FormattedMessage {...messages.mode_gyres} />
                      </TabLinkAnchor>
                    }
                  />
                </TabLinkWrapper>
                <TabLinkWrapper>
                  <TabLink
                    onClick={() => onSetTab('countries', uiState)}
                    active={tab === 'countries'}
                    disabled={tab === 'countries'}
                    label={
                      <TabLinkAnchor active={tab === 'countries'}>
                        <FormattedMessage {...messages.mode_countries} />
                      </TabLinkAnchor>
                    }
                  />
                </TabLinkWrapper>
              </Tabs>
            </PanelHeader>
            <PanelBody ref={cRef}>
              {tab}
            </PanelBody>
          </div>
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

PanelTransfers.propTypes = {
  onClose: PropTypes.func,
  onSetTab: PropTypes.func,
  // layersConfig: PropTypes.array,
  // locale: PropTypes.string,
  uiState: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  // layersConfig: state => selectLayersConfig(state),
  // locale: state => selectLocale(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  // activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetTab: (tab, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { tab }),
        ),
      ),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelTransfers);
// export default PanelTransfers;
