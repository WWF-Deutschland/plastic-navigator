/**
 *
 * PanelExplore
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, Text, Heading, Paragraph } from 'grommet';
import { Close, Layer } from 'grommet-icons';

import {
  selectLayersConfig,
  selectExploreConfig,
  selectLocale,
  selectUIStateByKey,
  selectActiveLayers,
} from 'containers/App/selectors';
import {
  setUIState,
  setLayerInfo,
  toggleLayer,
  setLayers,
} from 'containers/App/actions';

import GroupLayers from 'components/GroupLayers';

import messages from './messages';
// import commonMessages from 'messages';

const Styled = styled(props => <Box {...props} />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  pointer-events: all;
`;

const PanelHeader = styled(p => <Box background="black" {...p} />)``;
const PanelBody = styled(p => <Box {...p} />)``;
const TitleWrap = styled(Box)``;
const Title = styled(Text)``;
const Tabs = styled(p => <Box {...p} direction="row" />)``;
const TabLink = styled(p => <Button plain {...p} />)``;
const TabLinkAnchor = styled(Text)``;

const SectionLayerGroup = styled(Box)``;
const TitleGroup = styled(p => <Heading {...p} level={4} />)`
  margin-bottom: 0;
`;
const DescriptionGroup = styled(Paragraph)``;

const COMPONENT_KEY = 'PanelExplore';

const DEFAULT_UI_STATE = {
  tab: 0,
  layersMemo: null,
};

export function PanelExplore({
  onClose,
  onLayerInfo,
  onToggleLayer,
  onSetLayers,
  onMemoLayers,
  onSetTab,
  layersConfig,
  exploreConfig,
  locale,
  uiState,
  activeLayers,
}) {
  const { tab, layersMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  useEffect(() => {
    if (layersMemo && (!activeLayers || activeLayers.length === 0)) {
      onSetLayers(layersMemo);
    }
  }, []);
  useEffect(() => {
    onMemoLayers(activeLayers, uiState);
  }, [activeLayers]);

  const activeCategory = exploreConfig && exploreConfig[tab];
  return (
    <Styled background="white">
      <PanelHeader>
        <Button
          onClick={() => onClose()}
          icon={<Close size="xlarge" />}
          plain
          alignSelf="end"
        />
        <TitleWrap>
          <Layer size="xlarge" />
          <Title>
            <FormattedMessage {...messages.title} />
          </Title>
        </TitleWrap>
        <Tabs>
          {exploreConfig &&
            exploreConfig.map((category, index) => (
              <TabLink
                key={category.id}
                onClick={() => onSetTab(index, uiState)}
                active={tab === index}
                label={
                  <TabLinkAnchor active={tab === index}>
                    {category.title[locale]}
                  </TabLinkAnchor>
                }
              />
            ))}
        </Tabs>
      </PanelHeader>
      <PanelBody>
        {layersConfig &&
          activeCategory &&
          activeCategory.groups &&
          activeCategory.groups.map(group => (
            <SectionLayerGroup key={group.id}>
              <TitleGroup>{group.title[locale]}</TitleGroup>
              {group.description && (
                <DescriptionGroup>{group.description[locale]}</DescriptionGroup>
              )}
              <GroupLayers
                group={group}
                layers={layersConfig.filter(layer => layer.group === group.id)}
                locale={locale}
                activeLayers={activeLayers}
                onLayerInfo={onLayerInfo}
                onToggleLayer={onToggleLayer}
              />
            </SectionLayerGroup>
          ))}
        {layersConfig && activeCategory && !activeCategory.groups && (
          <SectionLayerGroup>
            <GroupLayers
              group={activeCategory}
              layers={layersConfig.filter(
                layer => layer.category === activeCategory.id,
              )}
              locale={locale}
              activeLayers={activeLayers}
              onLayerInfo={onLayerInfo}
              onToggleLayer={onToggleLayer}
            />
          </SectionLayerGroup>
        )}
      </PanelBody>
    </Styled>
  );
}

PanelExplore.propTypes = {
  onClose: PropTypes.func,
  onSetTab: PropTypes.func,
  onLayerInfo: PropTypes.func,
  onToggleLayer: PropTypes.func,
  onSetLayers: PropTypes.func,
  onMemoLayers: PropTypes.func,
  layersConfig: PropTypes.array,
  exploreConfig: PropTypes.array,
  activeLayers: PropTypes.array,
  locale: PropTypes.string,
  uiState: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  layersConfig: state => selectLayersConfig(state),
  exploreConfig: state => selectExploreConfig(state),
  locale: state => selectLocale(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
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
    onMemoLayers: (layers, uiState) =>
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, { layersMemo: layers }),
        ),
      ),
    onLayerInfo: id => dispatch(setLayerInfo(id)),
    onToggleLayer: id => dispatch(toggleLayer(id)),
    onSetLayers: layers => dispatch(setLayers(layers)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelExplore);
// export default PanelExplore;
