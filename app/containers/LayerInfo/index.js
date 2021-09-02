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
import { Close } from 'components/Icons';

import { PROJECT_CONFIG, POLICY_LAYERS } from 'config';

import { getAsideInfoWidth } from 'utils/responsive';
import { startsWith } from 'utils/string';
import { getLayerFeatureIds, getLayerId } from 'utils/layers';

import { selectSingleLayerContentConfig } from 'containers/App/selectors';

import LayerContent from './LayerContent';
import CountryChart from './CountryChart';
import ProjectContent from './ProjectContent';
import FeatureContent from './FeatureContent';
// import messages from './messages';

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

export function LayerInfo({ id, onClose, config, featured }) {
  const [layerId, featureId] = getLayerFeatureIds(id);

  let type;
  if (startsWith(layerId, `${PROJECT_CONFIG.id}-`)) {
    type = 'project';
  } else if (featureId && featureId === 'flist') {
    type = 'featureList';
  } else if (featureId && startsWith(featureId, 'plist')) {
    type = 'propertyList';
  } else if (featureId && startsWith(featureId, 'p-')) {
    type = 'property';
  } else if (config && featureId) {
    type = 'feature';
  } else if (config) {
    type = 'layer';
  }

  const cRef = useRef();
  useEffect(() => {
    cRef.current.scrollTop = 0;
  }, [id]);

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled panelWidth={getAsideInfoWidth(size)}>
          <ContentWrap ref={cRef}>
            {type === 'project' && (
              <ProjectContent id={layerId} location={featureId} />
            )}
            {type === 'feature' && (
              <FeatureContent featureId={featureId} config={config} />
            )}
            {type === 'layer' && (
              <LayerContent
                config={config}
                featured={featured}
                inject={
                  !featureId &&
                  config &&
                  POLICY_LAYERS.indexOf(config.id) > -1
                    ? [{
                      tag: '[CHART]',
                      el: (<CountryChart config={config} />)
                    },
                    {
                      tag: '[LAYERS-ALTERNATE]',
                      el: (<div>Alternate Layer Selection</div>)
                    }]
                    : null
                } />
            )}
          </ContentWrap>
          <ButtonClose onClick={() => onClose()} />
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

LayerInfo.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  config: PropTypes.object,
  featured: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  config: (state, { id }) => {
    const layerId = getLayerId(id);
    return selectSingleLayerContentConfig(state, { key: layerId });
  },
});

const withConnect = connect(
  mapStateToProps,
  null,
);

export default compose(withConnect)(LayerInfo);
