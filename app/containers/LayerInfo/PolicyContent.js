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
import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { decodeInfoView } from 'utils/layers';
import {
  getTopicFromData,
  getTopicsFromData,
  getPreviousTopicFromData,
  getNextTopicFromData,
  getCountriesWithStrongestPosition,
  getStatementsForTopic,
} from 'utils/policy';
// import CountryChart from './policy/CountryChart';
import CountryList from './policy/CountryList';
import SourceList from './policy/SourceList';
// import SourceContent from './policy/SourceContent';
// import CountryFeatureContent from './policy/CountryFeatureContent';
// import FeatureContent from './FeatureContent';
// import Alternates from './Alternates';
// import TitleIconPolicy from './TitleIconPolicy';
// import LayerReference from './LayerReference';
import LayerContent from './LayerContent';
import ButtonHide from './ButtonHide';
import ButtonClose from './ButtonClose';
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
  padding: 12px 12px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 12px 0;
  }
`;

const PanelBody = styled.div`
  padding: 12px 12px 96px;
`;

const IconWrap = styled.div`
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.brand};
  padding: 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
`;

const TitleShort = styled(p => <Text size="xxlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 3px;
  text-align: center;
  color: ${({ theme }) => theme.global.colors.brand};
`;

const TopicNav = styled(p => <Button plain {...p} />)`
  border-radius: 99999px;
  background: white;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
`;

const ButtonBack = styled(p => <Button {...p} plain />)`
  padding: 5px;
  position: absolute;
  left: 0;
  top: 0;
`;

const HeaderButtonText = styled(p => <Text size="medium" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 1;
  margin-top: 0;
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

const Description = styled(p => <Text {...p} />)``;

// prettier-ignore
const DropOption = styled(p => <Button plain {...p} />)`
  text-align: left;
  padding: 2px ${({ theme }) => theme.global.edgeSize.small};
  display: block;
  width: 100%;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  opacity: 1;
  color: ${({ theme }) => theme.global.colors.black };
  border-top: 1px solid ${({ theme }) => theme.global.colors.border.light };
  border-left: 4px solid transparent;
  font-size: ${({ theme }) => theme.text.xsmall.size};
  min-width: 120px;
  &:last-child {
    border-bottom: 1px solid
      ${({ theme, noBorderLast }) => noBorderLast
    ? 'transparent'
    : theme.global.colors.border.light};
  }
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 4px 32px 4px 12px;
    font-size: ${({ theme }) => theme.text.medium.size};
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

const DropContent = ({ active, options, onSelect, locale }) => (
  <Box margin="small" background="white" elevation="small">
    {options &&
      options.map(option => (
        <DropOption
          key={option.id}
          onClick={() => onSelect(option.id)}
          active={active === option.id}
          disabled={active === option.id}
        >
          {option[`short_${locale}`]}
        </DropOption>
      ))}
  </Box>
);
DropContent.propTypes = {
  onSelect: PropTypes.func,
  active: PropTypes.string,
  options: PropTypes.array,
  locale: PropTypes.string,
};

export function PolicyContent({
  view,
  config,
  layerData,
  intl,
  isModule,
  onHome,
  onSetTopic,
  theme,
  onClose,
  onSetTab,
}) {
  const { locale } = intl;
  const cRef = useRef();
  const [showTopicDrop, setShowTopicDrop] = useState(false);
  useEffect(() => {
    if (cRef && cRef.current) cRef.current.scrollTop = 0;
  }, [view]);
  const [layerId, subView] = decodeInfoView(view);
  const [, indicatorId] = layerId.split('_');
  const tab = subView || 'details';
  const topicOptions = getTopicsFromData(layerData);
  const topic = layerData && getTopicFromData({ indicatorId, layerData });
  const nextTopic =
    topic &&
    getNextTopicFromData({
      indicatorId,
      layerData,
      archived: topic.archived === '1',
    });
  const prevTopic =
    topic &&
    getPreviousTopicFromData({
      indicatorId,
      layerData,
      archived: topic.archived === '1',
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
                justify={topic.archived !== '1' ? 'between' : 'center'}
                align="center"
              >
                {topic.archived !== '1' && (
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
                    <DropContent
                      locale={locale}
                      active={topic.id}
                      options={topicOptions}
                      onSelect={id => {
                        setShowTopicDrop(false);
                        onSetTopic(id);
                      }}
                    />
                  }
                />
                {topic.archived !== '1' && (
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
            <Box margin={{ vertical: 'small' }}>
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
                      Details
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
                      States
                    </TabLinkAnchor>
                  }
                />
              </TabLinkWrapper>
              <TabLinkWrapper>
                <TabLink
                  onClick={() => onSetTab('statements', layerId)}
                  active={qe(tab, 'statements')}
                  disabled={qe(tab, 'statements')}
                  label={
                    <TabLinkAnchor active={qe(tab, 'statements')}>
                      Statements
                    </TabLinkAnchor>
                  }
                />
              </TabLinkWrapper>
            </Tabs>
          </PanelHeader>
        )}
        {config && tab === 'countries' && layerData && (
          <PanelBody>
            <CountryList
              countries={getCountriesWithStrongestPosition({
                indicatorId,
                layerData,
                locale,
              })}
              topic={topic}
              config={config}
            />
          </PanelBody>
        )}
        {config && tab === 'statements' && layerData && (
          <PanelBody>
            <SourceList
              sources={getStatementsForTopic({
                indicatorId,
                layerData,
                locale,
              })}
              topic={topic}
              config={config}
            />
          </PanelBody>
        )}
        {config && tab === 'details' && (
          <PanelBody>
            <Box margin={{ vertical: 'medium' }}>
              <strong>TODO: CHART</strong>
            </Box>
            <LayerContent fullLayerId={layerId} config={config} />
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
  layerData: PropTypes.object,
  theme: PropTypes.object,
  intl: intlShape,
  onHome: PropTypes.func,
  onClose: PropTypes.func,
  onSetTopic: PropTypes.func,
  onSetTab: PropTypes.func,
  isModule: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetTab: (tab, view) => {
      dispatch(setLayerInfo(view, tab));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(withTheme(PolicyContent)));
