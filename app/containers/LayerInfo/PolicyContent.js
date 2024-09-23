/**
 *
 * LayerContentPolicy
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled, { withTheme } from 'styled-components';
import { Box, Text, Button, DropButton } from 'grommet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import qe from 'utils/quasi-equals';
import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_TOPIC_ICONS } from 'config';

import {
  ArrowRight,
  ArrowLeft,
  Back,
  DropdownDown,
  DropdownUp,
} from 'components/Icons';
import {
  setLayerInfo,
  setItemInfo,
  setChartDate,
} from 'containers/App/actions';
import { selectChartDate } from 'containers/App/selectors';
import { loadLayer } from 'containers/Map/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { decodeInfoView } from 'utils/layers';
import {
  getTopicFromData,
  getTopicsFromData,
  getPreviousTopicFromData,
  getNextTopicFromData,
  getCountriesWithStrongestPosition,
  getStatementsForTopic,
  isArchived,
  isAggregate,
  getChildTopics,
} from 'utils/policy';
import CountryDetails from './policy/CountryDetails';
import CountryList from './policy/CountryList';
import SourceList from './policy/SourceList';
import TopicsList from './policy/TopicsList';
// import SourceContent from './policy/SourceContent';
// import CountryFeatureContent from './policy/CountryFeatureContent';
// import FeatureContent from './FeatureContent';
// import Alternates from './Alternates';
// import TitleIconPolicy from './TitleIconPolicy';
// import LayerReference from './LayerReference';
import PolicyOptionList from './PolicyOptionList';
import ButtonHide from './ButtonHide';
import ButtonClose from './ButtonClose';
import PanelBody from './PanelBody';
import messages from './messages';

const ContentWrap = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  width: 100%;
  bottom: 0;
  overflow-y: scroll;
`;

const PanelHeader = styled(p => (
  <Box justify="between" {...p} elevation="small" responsive={false} />
))`
  padding: 18px 12px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 12px 0;
  }
`;

const IconWrap = styled.div`
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.brand};
  padding: 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
`;

const TitleShort = styled(p => <Text {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  text-align: center;
  color: ${({ theme }) => theme.global.colors.brand};
  font-size: 26px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    font-size: 30px;
  }
`;

const TopicNav = styled(p => <Button plain {...p} />)`
  border-radius: 99999px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  padding: 7px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 10px;
  }
`;

const ButtonBack = styled(p => <Button {...p} plain />)`
  padding: 5px;
  position: absolute;
  left: 0;
  top: 0;
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderButtonText = styled(p => <Text size="medium" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: -1px;
`;

const StyledDropButton = styled(DropButton)`
  padding: 0 0 0 6px;
  color: ${({ theme }) => theme.global.colors.white} !important;
  background: transparent;
  vertical-align: middle;
  min-width: 50px;
  min-height: 50px;
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
`;

const Description = styled(p => <Text {...p} />)`
  font-size: 15px;
  line-height: 20px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    font-size: 17px;
    line-height: 23px;
  }
`;

const Tabs = styled(p => <Box {...p} direction="row" gap="xsmall" />)``;
const TabLinkWrapper = styled(p => <Box {...p} margin={{ right: 'xsmall' }} />)`
  position: relative;
`;

const TabLink = styled(p => <Button plain {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  line-height: 1;
  padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'brand' : 'textSecondary']};
  opacity: 1;
  border-bottom: 4px solid;
  border-color: ${({ theme, active }) =>
    active ? theme.global.colors.brand : 'transparent'};
  &:hover {
    color: ${({ theme }) => theme.global.colors.brandDark};
  }
`;
const TabLinkAnchor = styled(p => <Text size="xlarge" {...p} />)``;

export function PolicyContent({
  view,
  config,
  layerInfo,
  intl,
  isModule,
  onHome,
  onSetTopic,
  theme,
  onClose,
  onSetTab,
  onLoadLayer,
  onSelectStatement,
  onSetChartDate,
  chartDate,
}) {
  const { locale } = intl;
  const cRef = useRef();
  const [showTopicDrop, setShowTopicDrop] = useState(false);
  useEffect(() => {
    // kick off loading of page content
    onLoadLayer(config.id, config);
  }, [config]);
  useEffect(() => {
    if (cRef && cRef.current) cRef.current.scrollTop = 0;
  }, [view]);
  const [layerId, subView] = decodeInfoView(view);
  const [, indicatorId] = layerId.split('_');
  const tab = subView || 'details';
  const topicOptions = getTopicsFromData(layerInfo);
  const topic = layerInfo && getTopicFromData({ indicatorId, layerInfo });
  const isTopicArchived = !!isArchived(topic);
  const isTopicAggregate = !!isAggregate(topic);
  const nextTopic =
    topic &&
    getNextTopicFromData({
      indicatorId,
      layerInfo,
      archived: isTopicArchived,
    });
  const prevTopic =
    topic &&
    getPreviousTopicFromData({
      indicatorId,
      layerInfo,
      archived: isTopicArchived,
    });
  const Icon = p => POLICY_TOPIC_ICONS[indicatorId](p);
  return (
    <>
      <ContentWrap ref={cRef}>
        {config && topic && (
          <PanelHeader>
            <Box align="center" style={{ position: 'relative' }}>
              {isModule && (
                <ButtonBack plain onClick={() => onHome()}>
                  <Box direction="row" align="center" gap="xsmall">
                    <Back size="12px" />
                    <HeaderButtonText>
                      <FormattedMessage {...messages.moduleOverview} />
                    </HeaderButtonText>
                  </Box>
                </ButtonBack>
              )}
              <IconWrap>
                <Icon color="white" />
              </IconWrap>
              {isModule && <ButtonHide onClick={onClose} />}
            </Box>
            {onSetTopic && isModule && topicOptions && (
              <Box
                margin={{ top: 'small', bottom: 'small' }}
                direction="row"
                justify={isTopicArchived ? 'center' : 'between'}
                align="center"
              >
                {!isTopicArchived && (
                  <TopicNav onClick={() => onSetTopic(prevTopic.id)}>
                    <ArrowLeft color={theme.global.colors.brand} size="24px" />
                  </TopicNav>
                )}
                <StyledDropButton
                  plain
                  reverse
                  gap="xxsmall"
                  open={showTopicDrop}
                  fill="vertical"
                  onClose={() => setShowTopicDrop(false)}
                  onOpen={() => setShowTopicDrop(true)}
                  dropProps={{
                    align: { top: 'bottom' },
                    plain: true,
                  }}
                  icon={
                    showTopicDrop ? (
                      <DropdownUp color={theme.global.colors.brand} />
                    ) : (
                      <DropdownDown color={theme.global.colors.brand} />
                    )
                  }
                  label={
                    <TitleShort>
                      {topic[`short_${locale}`] ||
                        topic[`short_${DEFAULT_LOCALE}`]}
                    </TitleShort>
                  }
                  dropContent={
                    <PolicyOptionList
                      active={topic.id}
                      options={topicOptions}
                      onSelect={id => {
                        setShowTopicDrop(false);
                        onSetTopic(id);
                      }}
                    />
                  }
                />
                {!isTopicArchived && (
                  <TopicNav onClick={() => onSetTopic(nextTopic.id)}>
                    <ArrowRight color={theme.global.colors.brand} size="24px" />
                  </TopicNav>
                )}
              </Box>
            )}
            {!isModule && (
              <Box margin={{ top: 'small', bottom: 'small' }} align="center">
                <TitleShort>
                  {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
                </TitleShort>
              </Box>
            )}
            <Box
              margin={{ top: 'small', horizontal: 'small', bottom: 'medium' }}
            >
              <Description>
                {topic[`description_${locale}`] ||
                  topic[`description_${DEFAULT_LOCALE}`]}
              </Description>
            </Box>
            <Tabs>
              <TabLinkWrapper>
                <TabLink
                  onClick={() => onSetTab('details', layerId)}
                  active={qe(tab, 'details')}
                  disabled={qe(tab, 'details')}
                  label={
                    <TabLinkAnchor active={qe(tab, 'details')}>
                      <FormattedMessage {...messages.tabDetails} />
                    </TabLinkAnchor>
                  }
                />
              </TabLinkWrapper>
              <TabLinkWrapper>
                <TabLink
                  onClick={() => onSetTab('countries', layerId)}
                  active={qe(tab, 'countries')}
                  disabled={qe(tab, 'countries')}
                  label={
                    <TabLinkAnchor active={qe(tab, 'countries')}>
                      <FormattedMessage {...messages.tabCountries} />
                    </TabLinkAnchor>
                  }
                />
              </TabLinkWrapper>
              {!isTopicAggregate && (
                <TabLinkWrapper>
                  <TabLink
                    onClick={() => onSetTab('statements', layerId)}
                    active={qe(tab, 'statements')}
                    disabled={qe(tab, 'statements')}
                    label={
                      <TabLinkAnchor active={qe(tab, 'statements')}>
                        <FormattedMessage {...messages.tabStatements} />
                      </TabLinkAnchor>
                    }
                  />
                </TabLinkWrapper>
              )}
              {isTopicAggregate && (
                <TabLinkWrapper>
                  <TabLink
                    onClick={() => onSetTab('topics', layerId)}
                    active={qe(tab, 'topics')}
                    disabled={qe(tab, 'topics')}
                    label={
                      <TabLinkAnchor active={qe(tab, 'topics')}>
                        <FormattedMessage {...messages.tabTopics} />
                      </TabLinkAnchor>
                    }
                  />
                </TabLinkWrapper>
              )}
            </Tabs>
          </PanelHeader>
        )}
        {layerInfo && tab === 'details' && (
          <CountryDetails
            layerInfo={layerInfo}
            indicator={topic}
            onSelectStatement={onSelectStatement}
            onSetChartDate={onSetChartDate}
            chartDate={chartDate}
            config={config}
            layerId={layerId}
            isTopicArchived={isTopicArchived}
          />
        )}
        {config && tab === 'countries' && layerInfo && (
          <PanelBody>
            <CountryList
              countries={getCountriesWithStrongestPosition({
                indicatorId,
                layerInfo,
                locale,
              })}
              topic={topic}
              config={config}
            />
          </PanelBody>
        )}
        {config && tab === 'statements' && layerInfo && (
          <PanelBody>
            <SourceList
              sources={getStatementsForTopic({
                indicatorId,
                layerInfo,
                locale,
              })}
              topic={topic}
              config={config}
            />
          </PanelBody>
        )}
        {config && tab === 'topics' && layerInfo && (
          <PanelBody>
            <TopicsList
              topics={getChildTopics(topic, topicOptions, locale)}
              config={config}
              onSetTopic={id => onSetTopic(id)}
            />
          </PanelBody>
        )}
      </ContentWrap>
      {!isModule && <ButtonClose onClick={onClose} />}
    </>
  );
}

PolicyContent.propTypes = {
  view: PropTypes.string,
  config: PropTypes.object,
  layerInfo: PropTypes.object,
  theme: PropTypes.object,
  intl: intlShape,
  onHome: PropTypes.func,
  onClose: PropTypes.func,
  onSetTopic: PropTypes.func,
  onSetTab: PropTypes.func,
  onSelectStatement: PropTypes.func,
  onLoadLayer: PropTypes.func,
  isModule: PropTypes.bool,
  onSetChartDate: PropTypes.func,
  chartDate: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  layerInfo: (state, { config }) => selectLayerByKey(state, config.id),
  chartDate: state => selectChartDate(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetTab: (tab, layerId) => {
      dispatch(setLayerInfo({ layerId, view: tab }));
    },
    onSetChartDate: dateString => {
      dispatch(setChartDate(dateString));
    },
    onLoadLayer: (id, config) => {
      dispatch(loadLayer(id, config));
    },
    onSelectStatement: (statementId, layerId) => {
      dispatch(setItemInfo(`${layerId}|source-${statementId}`));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(withTheme(PolicyContent)));
