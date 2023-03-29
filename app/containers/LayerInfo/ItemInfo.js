/**
 *
 * ItemInfo
 *
 */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { ResponsiveContext } from 'grommet';

import { POLICY_LAYER } from 'config';

import { getAsideInfoWidth } from 'utils/responsive';
import { startsWith } from 'utils/string';
import { decodeInfoView, getLayerIdFromView } from 'utils/layers';
import { selectLayerByKey } from 'containers/Map/selectors';

import SourceContent from './policy/SourceContent';
import CountryFeatureContent from './policy/CountryFeatureContent';
import ButtonClose from './ButtonClose';
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
const ContentWrap = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  bottom: 0;
  overflow-y: scroll;
`;
export function ItemInfo({
  onClose,
  item,
  layerData,
  onSetTopic,
  // onShowLayerPanel,
}) {
  const cRef = useRef();
  useEffect(() => {
    if (cRef && cRef.current) cRef.current.scrollTop = 0;
  }, [item]);
  const [layerIndicator, itemType] = decodeInfoView(item);
  if (!layerIndicator || !itemType) {
    return null;
  }
  const [layerIdX, indicatorId] = layerIndicator.split('_');
  const [type, itemId] = itemType.split(/-(.*)/s);

  // prettier-ignore
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled panelWidth={getAsideInfoWidth(size)}>
          <ContentWrap ref={cRef}>
            {type === 'source' && (
              <SourceContent
                sourceId={itemId}
                indicatorId={indicatorId}
                onSetIndicator={topicId => onSetTopic({
                  topicId,
                  itemId,
                  type,
                  layerIdX,
                })}
                layerData={layerData}
                onClose={onClose}
              />
            )}
            {type === 'country' && (
              <CountryFeatureContent
                featureId={itemId}
                indicatorId={indicatorId}
                layerData={layerData}
                onSetIndicator={topicId => onSetTopic({
                  topicId,
                  itemId,
                  type,
                  layerIdX,
                })}
                onClose={onClose}
              />
            )}
          </ContentWrap>
          <ButtonClose onClick={onClose} />
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

ItemInfo.propTypes = {
  item: PropTypes.string,
  onClose: PropTypes.func,
  onSetTopic: PropTypes.func,
  layerData: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  layerData: (state, { item }) => {
    const layerId = getLayerIdFromView(item);
    const isPolicy = startsWith(layerId, POLICY_LAYER);
    return selectLayerByKey(state, isPolicy ? POLICY_LAYER : layerId);
  },
});

const withConnect = connect(
  mapStateToProps,
  null,
);

export default compose(withConnect)(ItemInfo);
