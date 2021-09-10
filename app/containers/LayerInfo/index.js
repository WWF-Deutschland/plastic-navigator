/**
 *
 * LayerInfo
 *
 */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button, ResponsiveContext } from 'grommet';

import { PROJECT_CONFIG, POLICY_LAYERS } from 'config';

import { getAsideInfoWidth } from 'utils/responsive';
import { startsWith } from 'utils/string';
import { decodeInfoView, getLayerIdFromView } from 'utils/layers';

import {
  selectSingleLayerContentConfig,
  selectLayerPanelHidden,
} from 'containers/App/selectors';
import { setLayerInfoHidden } from 'containers/App/actions';

import { Close } from 'components/Icons';

import LayerContent from './LayerContent';
import CountryList from './CountryList';
import SourceList from './SourceList';
import CountryChart from './CountryChart';
import ProjectContent from './ProjectContent';
import FeatureContent from './FeatureContent';

const ContentWrap = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  bottom: 0;
  overflow-y: scroll;
  padding: 12px 24px 64px;
`;

const Styled = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: all;
  overflow-y: auto;
  z-index: 4003;
  background: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    z-index: 2999;
    position: absolute;
    width: ${({ panelWidth }) => panelWidth || 500}px;
    left: auto;
  }
`;

const ButtonClose = styled(p => (
  <Button icon={<Close color="white" />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.black};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 10px;
    right: 30px;
  }
`;

export function LayerInfo({
  view,
  config,
  featured,
  currentModule,
  onClose,
  hidden,
  onHideLayerPanel,
  // onShowLayerPanel,
}) {
  const [layerId, layerView] = decodeInfoView(view);

  const cRef = useRef();
  useEffect(() => {
    if (cRef && cRef.current) cRef.current.scrollTop = 0;
  }, [view]);
  // useEffect(() => {
  //   setOpen(true);
  // }, [view]);

  let type;
  if (startsWith(layerId, `${PROJECT_CONFIG.id}-`)) {
    type = 'project';
  } else if (layerView && layerView === 'countries') {
    type = 'countryList';
  } else if (layerView && startsWith(layerView, 'sources')) {
    type = 'sourceList';
  } else if (layerView && startsWith(layerView, 'source-')) {
    type = 'source';
  } else if (config && layerView) {
    type = 'feature';
  } else if (config) {
    type = 'layer';
  }

  const isModule =
    currentModule &&
    currentModule.featuredLayer &&
    currentModule.featuredLayer === layerId;

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <div>
          {(!isModule || !hidden) && (
            <Styled panelWidth={getAsideInfoWidth(size)}>
              <ContentWrap ref={cRef}>
                {type === 'project' && (
                  <ProjectContent id={layerId} location={layerView} />
                )}
                {type === 'feature' && (
                  <FeatureContent featureId={layerView} config={config} />
                )}
                {type === 'countryList' && (
                  <CountryList config={config} />
                )}
                {type === 'sourceList' && (
                  <SourceList config={config} />
                )}
                {type === 'layer' && (
                  <LayerContent
                    config={config}
                    featured={featured}
                    inject={
                      !layerView &&
                      config &&
                      POLICY_LAYERS.indexOf(config.id) > -1
                        ? [{
                          tag: '[CHART]',
                          el: (<CountryChart config={config} />)
                        },
                        {
                          tag: '[LAYERS-ALTERNATE]',
                          el: (<div>TODO: Alternate Layer Selection</div>)
                        }]
                        : null
                    } />
                )}
              </ContentWrap>
              <ButtonClose
                onClick={() => {
                  if (isModule) {
                    onHideLayerPanel();
                  } else {
                    onClose();
                  }
                }}
              />
            </Styled>
          )}
        </div>
      )}
    </ResponsiveContext.Consumer>
  );
}

LayerInfo.propTypes = {
  view: PropTypes.string,
  onClose: PropTypes.func,
  // onShowLayerPanel: PropTypes.func,
  onHideLayerPanel: PropTypes.func,
  config: PropTypes.object,
  featured: PropTypes.object,
  currentModule: PropTypes.object,
  hidden: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  config: (state, { view }) => {
    const layerId = getLayerIdFromView(view);
    return selectSingleLayerContentConfig(state, { key: layerId });
  },
  hidden: state => selectLayerPanelHidden(state),
});

function mapDispatchToProps(dispatch) {
  return {
    // onShowLayerPanel: () => dispatch(setLayerInfoHidden(false)),
    onHideLayerPanel: () => dispatch(setLayerInfoHidden(true)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerInfo);
