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

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG, POLICY_LAYER } from 'config';

import { getAsideInfoWidth } from 'utils/responsive';
import { startsWith } from 'utils/string';
import { decodeInfoView, getLayerIdFromView } from 'utils/layers';

import {
  selectSingleLayerContentConfig,
  selectLocale,
} from 'containers/App/selectors';

import { Close } from 'components/Icons';

import CountryChart from './policy/CountryChart';
import CountryList from './policy/CountryList';
import SourceList from './policy/SourceList';
import SourceContent from './policy/SourceContent';
import CountryFeatureContent from './policy/CountryFeatureContent';
import LayerContent from './LayerContent';
import ProjectContent from './ProjectContent';
import FeatureContent from './FeatureContent';
import Alternates from './Alternates';
import TitleIcon from './TitleIcon';
import TitleIconPolicy from './TitleIconPolicy';

const ContentWrap = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  bottom: 0;
  overflow-y: scroll;
  padding: 12px 12px 64px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 12px 24px 64px;
  }
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

const ButtonClose = styled(p => <Button plain alignSelf="end" {...p} />)`
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
  onClose,
  locale,
  isModule,
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

  const isPolicy = startsWith(layerId, POLICY_LAYER);

  let type;
  if (startsWith(layerId, `${PROJECT_CONFIG.id}-`)) {
    type = 'project';
  } else if (isPolicy && !layerView) {
    type = 'policyTopic';
  } else if (isPolicy && layerView && layerView === 'countries') {
    type = 'countryList';
  } else if (isPolicy && layerView && startsWith(layerView, 'sources')) {
    type = 'sourceList';
  } else if (isPolicy && layerView && startsWith(layerView, 'source-')) {
    type = 'source';
  } else if (isPolicy && config && layerView && isPolicy && config.tooltip) {
    type = 'feature';
  } else if (config) {
    type = 'layer';
  }

  let title = '';
  if (config && config.title) {
    title = config.title[locale] || config.title[DEFAULT_LOCALE];
  }
  let titleHeader = title;
  if (isModule && config && config['title-module']) {
    titleHeader =
      config['title-module'][locale] || config['title-module'][DEFAULT_LOCALE];
  }
  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled panelWidth={getAsideInfoWidth(size)}>
          <ContentWrap ref={cRef}>
            {type === 'project' && (
              <ProjectContent
                id={layerId}
                location={layerView}
              />
            )}
            {type === 'feature' && !isPolicy && config && (
              <FeatureContent
                featureId={layerView}
                config={config}
                supTitle={title}
                headerFallback={<TitleIcon title={title}/>}
              />
            )}
            {type === 'feature' && isPolicy && config && (
              <CountryFeatureContent
                featureId={layerView}
                config={config}
                supTitle={title}
                headerFallback={
                  isModule
                    ? <TitleIconPolicy title={title}/>
                    : <TitleIcon title={title}/>
                }
              />
            )}
            {isPolicy && type === 'source' && config && (
              <SourceContent
                sourceId={layerView}
                config={config}
                supTitle={title}
              />
            )}
            {isPolicy && type === 'countryList' && config && (
              <CountryList config={config} supTitle={title} />
            )}
            {isPolicy && type === 'sourceList' && config && (
              <SourceList config={config} supTitle={title}/>
            )}
            {type === 'layer' && config && (
              <LayerContent
                config={config}
                title={title}
                header={isModule
                  ? <TitleIconPolicy title={titleHeader}/>
                  : <TitleIcon title={titleHeader}/>
                }
              />
            )}
            {type === 'policyTopic' && config && (
              <LayerContent
                config={config}
                sublayerId={layerId}
                title={title}
                header={isModule
                  ? <TitleIconPolicy title={titleHeader}/>
                  : <TitleIcon title={titleHeader}/>
                }
                inject={
                  !layerView &&
                  config &&
                  isPolicy
                    ? [{
                      tag: '[CHART]',
                      el: (<CountryChart config={config} />)
                    },
                    {
                      tag: '[LAYERS-ALTERNATE]',
                      el: (<Alternates config={config} />)
                    }]
                    : null
                }
              />
            )}
          </ContentWrap>
          <ButtonClose
            onClick={onClose}
            icon={<Close color="white" />}
          />
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

LayerInfo.propTypes = {
  view: PropTypes.string,
  onClose: PropTypes.func,
  // onShowLayerPanel: PropTypes.func,
  config: PropTypes.object,
  isModule: PropTypes.bool,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  config: (state, { view }) => {
    const layerId = getLayerIdFromView(view);
    const isPolicy = startsWith(layerId, POLICY_LAYER);
    return selectSingleLayerContentConfig(state, {
      key: isPolicy ? POLICY_LAYER : layerId,
    });
  },
  locale: state => selectLocale(state),
});

// function mapDispatchToProps() {
//   return {
//     // onShowLayerPanel: () => dispatch(showLayerInfoModule(false)),
//     // onHideLayerPanel: () => dispatch(showLayerInfoModule(false)),
//   };
// }

const withConnect = connect(
  mapStateToProps,
  null,
);

export default compose(withConnect)(LayerInfo);
