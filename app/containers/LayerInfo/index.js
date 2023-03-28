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

import LayerContent from './LayerContent';
import PolicyContent from './PolicyContent';
import ProjectContent from './ProjectContent';
import TitleIcon from './TitleIcon';

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
  onHome,
  onSetTopic,
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

  let type;
  if (startsWith(layerId, `${PROJECT_CONFIG.id}-`)) {
    type = 'project';
  } else if (startsWith(layerId, POLICY_LAYER)) {
    type = 'policyTopic';
  } else if (config) {
    type = 'layer';
  }

  let title = '';
  if (config && config.title) {
    title = config.title[locale] || config.title[DEFAULT_LOCALE];
  }
  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled panelWidth={getAsideInfoWidth(size)}>
          {type === 'policyTopic' && config && (
            <PolicyContent
              isModule={isModule}
              config={config}
              view={view}
              onHome={onHome}
              onSetTopic={onSetTopic}
            />
          )}
          {type !== 'policyTopic' && (
            <ContentWrap ref={cRef}>
              {type === 'project' && (
                <ProjectContent
                  id={layerId}
                  location={layerView}
                />
              )}
              {type === 'layer' && config && (
                <LayerContent
                  config={config}
                  title={title}
                  header={<TitleIcon title={title}/>}
                />
              )}
            </ContentWrap>
          )}
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
  onHome: PropTypes.func,
  onSetTopic: PropTypes.func,
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
