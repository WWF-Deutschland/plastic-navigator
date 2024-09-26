/**
 *
 * ModulePolicy
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { DEFAULT_LOCALE } from 'i18n';

import styled from 'styled-components';
// import { Box, Button, ResponsiveContext } from 'grommet';
import { Text, Box, Button, ResponsiveContext } from 'grommet';
// import { getAsideWidth, isMaxSize } from 'utils/responsive';
import { decodeInfoView, getLayerIdFromView } from 'utils/layers';
import { MODULES, POLICY_LAYER } from 'config';

import ModuleWrap from 'components/ModuleWrap';
import Modal from 'components/Modal';
import { Policy } from 'components/Icons';
import LayerInfo from 'containers/LayerInfo';
import ItemInfo from 'containers/LayerInfo/ItemInfo';
import LayerContent from 'containers/LayerInfo/LayerContent';

import {
  selectActiveLayers,
  selectUIStateByKey,
  selectFirstLanding,
  selectInfoSearch,
  selectUIURLByKey,
  selectItemInfoSearch,
} from 'containers/App/selectors';
import { selectLayerConfig, selectLayerByKey } from 'containers/Map/selectors';
import {
  setLayers,
  setUIState,
  setLanding,
  setLayerInfo,
  setItemInfo,
  showLayerInfoModule,
  setUIURL,
  setShowKey,
} from 'containers/App/actions';

import { startsWith } from 'utils/string';
import { isArchived, isAggregate, isHidden } from 'utils/policy';

import commonMessages from 'messages';
import messages from './messages';
import TopicCard from './TopicCard';
import TopicCardAggregate from './TopicCardAggregate';

const CurrentTopicsWrapper = styled(props => (
  <Box
    margin={{ top: 'medium', bottom: 'small' }}
    pad={{ top: 'medium', bottom: 'small', horizontal: 'medium' }}
    gap="small"
    background="brand"
    elevation="medium"
    {...props}
  />
))``;
const ArchivedTopicsWrapper = styled(props => <Box {...props} />)``;

const Buttons = styled(props => <Box gap="small" direction="row" {...props} />)`
  position: absolute;
  right: 12px;
  top: 22px;
  pointer-events: all;
`;

// prettier-ignore
const ShowButton = styled(p => <Button plain reverse {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 16px;
  background: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'white' : 'brand']};
  color: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'black' : 'white']};
  border-radius: 20px;
  padding: 2px 13px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  &:hover {
    background: ${({ theme, projects }) =>
    theme.global.colors[projects ? 'lightHover' : 'brandDark']};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 5px 15px 5px 21px;
  }
`;
const TitleShort = styled(Text)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
`;
const Title = styled(p => <Text {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
`;
const TitleSelect = styled(p => <Text size="xlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 10px;
`;
const TitleSelectWrapper = styled(p => (
  <Box {...p} align="center" margin={{ top: 'large' }} />
))``;
const TopicCardWrap = styled(p => <Box {...p} />)`
  width: 100%;
`;

const COMPONENT_KEY = 'mpol';

const DEFAULT_UI_STATE = {
  layersMemo: null, // layers on map
  viewMemo: null, // info panel view
};
const DEFAULT_UI_URL_STATE = {
  show: true,
};

const isModuleLayerActive = activeLayers =>
  !!activeLayers.find(l => startsWith(l, POLICY_LAYER));
const getActiveModuleLayer = activeLayers =>
  activeLayers.find(l => startsWith(l, POLICY_LAYER));

export function ModulePolicy({
  onSetLayers,
  uiState,
  onMemo,
  activeLayers,
  firstLanding,
  onSetLanding,
  intl,
  onSetLayerInfo,
  onSetItemInfo,
  info,
  uiURL,
  onShow,
  onHideLayerInfo,
  onShowKey,
  config,
  moduleLayer,
  itemInfo,
}) {
  const { locale } = intl;
  const layerId = getLayerIdFromView(info);
  // const { layersMemo, viewMemo } = uiState
  const { layersMemo, viewMemo } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;
  const { show } = uiURL
    ? Object.assign({}, DEFAULT_UI_STATE, uiURL)
    : DEFAULT_UI_URL_STATE;

  useEffect(() => {
    if (layersMemo) {
      onSetLayers(layersMemo);
    } else if (MODULES.policy.layers) {
      if (!firstLanding || activeLayers.length === 0) {
        onSetLayers(MODULES.policy.layers);
      }
    }
    if (firstLanding) {
      onSetLanding();
    }
  }, []);
  useEffect(() => {
    if (isModuleLayerActive(activeLayers)) {
      onShowKey(true);
    } else {
      onShowKey(false);
    }
  }, [activeLayers]);

  // // unhide layer info
  useEffect(() => {
    onHideLayerInfo();
    if (info === '' && show) {
      onShow(true, uiURL);
    }
  });

  // set feature layer info if unset (ie after closing other layerinfo)
  useEffect(() => {
    if (info === '' && viewMemo) {
      onSetLayerInfo(viewMemo);
    }
    if (isModuleLayerActive(activeLayers)) {
      const activeModuleLayer = getActiveModuleLayer(activeLayers);
      const [infoLayerId] = decodeInfoView(info);
      if (infoLayerId !== activeModuleLayer) {
        onSetLayerInfo(activeModuleLayer);
      }
    }
  }, [info, activeLayers]);

  // remember active layers and current info view (featured layer only)
  useEffect(() => {
    let newUIState = {};
    if (startsWith(layerId, MODULES.policy.featuredLayer)) {
      newUIState = Object.assign({}, { viewMemo: info });
    }
    // newUIState = Object.assign({}, newUIState, {
    //   layersMemo: activeLayers,
    // });
    onMemo(newUIState, uiState);
  }, [activeLayers, info]);

  // <ResponsiveContext.Consumer>
  const topicSelected = isModuleLayerActive(activeLayers);
  // {size => (
  // const isModuleInfo = startsWith(info, MODULES.policy.featuredLayer);
  const ref = React.useRef(null);
  const layerConfig = config && config.find(l => l.id === POLICY_LAYER);
  const topicsData =
    moduleLayer &&
    moduleLayer.data.tables &&
    moduleLayer.data.tables.topics &&
    moduleLayer.data.tables.topics.data &&
    moduleLayer.data.tables.topics.data.data &&
    moduleLayer.data.tables.topics.data.data.filter(t => !isHidden(t));

  // const topicsAggregated =
  //   topicsData && topicsData.filter(t => isAggregate(t) && !isArchived(t));

  let topicsCurrent =
    topicsData && topicsData.filter(t => !isAggregate(t) && !isArchived(t));
  // topicsData && topicsData.filter(t => !isAggregate(t) && !isArchived(t));

  const topicsArchived =
    topicsData && topicsData.filter(t => !isAggregate(t) && isArchived(t));
  const hasArchived = topicsArchived && topicsArchived.length > 0;
  const aggregateTopic = topicsData && topicsData.find(t => isAggregate(t));

  if (aggregateTopic) {
    const childTopicIds = aggregateTopic.aggregate
      .split(',')
      .map(id => id.trim());
    topicsCurrent = topicsCurrent.filter(t => childTopicIds.indexOf(t.id) > -1);
  }
  const hasCurrent = topicsCurrent && topicsCurrent.length > 0;

  const size = React.useContext(ResponsiveContext);

  return (
    <div>
      <Helmet>
        <title>{`${intl.formatMessage(
          commonMessages.module_policy_metaTitle,
        )}`}</title>
      </Helmet>
      <ModuleWrap ref={ref}>
        {!topicSelected && layerConfig && ref && (
          <Modal
            content={
              <LayerContent
                header={
                  <Box>
                    <Box align="center">
                      <Policy color="black" />
                      <TitleShort>
                        {layerConfig['title-short'][locale] ||
                          layerConfig['title-short'][DEFAULT_LOCALE]}
                      </TitleShort>
                    </Box>
                    <Box align="center" margin={{ vertical: 'small' }}>
                      <Title size={size === 'small' ? 'xxlarge' : 'xxxlarge'}>
                        {layerConfig.title[locale] ||
                          layerConfig.title[DEFAULT_LOCALE]}
                      </Title>
                    </Box>
                  </Box>
                }
                config={layerConfig}
                inject={[
                  {
                    tag: '[SELECT-TOPICS-CURRENT]',
                    el:
                      aggregateTopic || hasCurrent ? (
                        <Box margin={{ top: 'ml', bottom: 'medium' }}>
                          <TitleSelect>
                            <FormattedMessage
                              {...messages.selectCurrentTopics}
                            />
                          </TitleSelect>
                          <CurrentTopicsWrapper>
                            {aggregateTopic && (
                              <TopicCardAggregate
                                key={aggregateTopic.id}
                                topic={aggregateTopic}
                                onTopicSelect={id =>
                                  onSetLayers([
                                    ...activeLayers,
                                    `${POLICY_LAYER}_${id}`,
                                  ])
                                }
                              />
                            )}
                            {topicsCurrent && (
                              <TitleSelectWrapper>
                                <TitleSelect size="large">
                                  <FormattedMessage
                                    {...messages.selectTopics}
                                  />
                                </TitleSelect>
                              </TitleSelectWrapper>
                            )}
                            {topicsCurrent && (
                              <TopicCardWrap
                                direction={size === 'small' ? 'column' : 'row'}
                                margin={{ top: 'small' }}
                                wrap
                              >
                                {topicsCurrent.map(t => (
                                  <TopicCard
                                    key={t.id}
                                    count={topicsCurrent.length}
                                    topic={t}
                                    onTopicSelect={id =>
                                      onSetLayers([
                                        ...activeLayers,
                                        `${POLICY_LAYER}_${id}`,
                                      ])
                                    }
                                  />
                                ))}
                              </TopicCardWrap>
                            )}
                          </CurrentTopicsWrapper>
                        </Box>
                      ) : null,
                  },
                  {
                    tag: '[SELECT-TOPICS-ARCHIVE]',
                    el: hasArchived ? (
                      <ArchivedTopicsWrapper
                        margin={{ top: 'medium', bottom: 'small' }}
                      >
                        <TitleSelect>
                          <FormattedMessage
                            {...messages.selectArchivedTopics}
                          />
                        </TitleSelect>
                        <Box direction="row" margin={{ top: 'medium' }}>
                          {topicsArchived &&
                            topicsArchived.map(t => (
                              <TopicCard
                                key={t.id}
                                archived
                                count={topicsArchived.length}
                                topic={t}
                                onTopicSelect={id =>
                                  onSetLayers([
                                    ...activeLayers,
                                    `${POLICY_LAYER}_${id}`,
                                  ])
                                }
                              />
                            ))}
                        </Box>
                      </ArchivedTopicsWrapper>
                    ) : null,
                  },
                ]}
              />
            }
          />
        )}
        {topicSelected && (
          <Buttons>
            <ShowButton
              onClick={() => {
                onShow(true, uiURL);
              }}
              icon={<Policy color="white" size="26px" />}
              label={<FormattedMessage {...messages.showLayerPanel} />}
            />
          </Buttons>
        )}
        {topicSelected && info && show && (
          <LayerInfo
            isModule
            view={info}
            onClose={() => onShow(false, uiURL)}
            onHome={() => onSetLayers(MODULES.policy.layers)}
            onSetTopic={topicId => {
              onSetLayers([
                MODULES.policy.layers,
                `${POLICY_LAYER}_${topicId}`,
              ]);
            }}
            currentModule={MODULES.policy}
          />
        )}
        {topicSelected && itemInfo && (
          <ItemInfo
            isModule
            item={itemInfo}
            onClose={() => onSetItemInfo()}
            onSetTopic={({ layerIdX, topicId, itemId, type }) => {
              onSetItemInfo(`${layerIdX}_${topicId}|${type}-${itemId}`);
              onSetLayers([
                MODULES.policy.layers,
                `${POLICY_LAYER}_${topicId}`,
              ]);
            }}
            currentModule={MODULES.policy}
          />
        )}
      </ModuleWrap>
    </div>
  );
}
// </ResponsiveContext.Consumer>

ModulePolicy.propTypes = {
  onSetLayers: PropTypes.func,
  onMemo: PropTypes.func,
  onSetLanding: PropTypes.func,
  onShowKey: PropTypes.func,
  activeLayers: PropTypes.array,
  uiState: PropTypes.object,
  uiURL: PropTypes.object,
  moduleLayer: PropTypes.object,
  firstLanding: PropTypes.bool,
  infoVisible: PropTypes.bool,
  info: PropTypes.string,
  itemInfo: PropTypes.string,
  onSetLayerInfo: PropTypes.func,
  onSetItemInfo: PropTypes.func,
  onHideLayerInfo: PropTypes.func,
  onShow: PropTypes.func,
  intl: intlShape.isRequired,
  config: PropTypes.array,
};

const mapStateToProps = createStructuredSelector({
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  activeLayers: state => selectActiveLayers(state),
  firstLanding: state => selectFirstLanding(state),
  info: state => selectInfoSearch(state),
  itemInfo: state => selectItemInfoSearch(state),
  uiURL: state => selectUIURLByKey(state, { key: COMPONENT_KEY }),
  config: state => selectLayerConfig(state),
  moduleLayer: state => selectLayerByKey(state, MODULES.policy.featuredLayer),
});

function mapDispatchToProps(dispatch) {
  return {
    onShowKey: show => dispatch(setShowKey(show)),
    onSetLanding: () => dispatch(setLanding()),
    onSetLayers: layers => dispatch(setLayers(layers)),
    onSetLayerInfo: id => {
      dispatch(setLayerInfo({ layerId: id }));
    },
    onSetItemInfo: id => {
      dispatch(setItemInfo(id));
    },
    onShow: (show, uiURL) =>
      dispatch(
        setUIURL(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_URL_STATE, uiURL, { show }),
        ),
      ),
    onHideLayerInfo: () => dispatch(showLayerInfoModule(false)),
    onMemo: (newUIState, uiState) => {
      dispatch(
        setUIState(
          COMPONENT_KEY,
          Object.assign({}, DEFAULT_UI_STATE, uiState, newUIState),
        ),
      );
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ModulePolicy));
// export default ModuleExplore;
