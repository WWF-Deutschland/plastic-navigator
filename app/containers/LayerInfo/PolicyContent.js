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

import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_TOPIC_ICONS } from 'config';

import {
  ArrowRight,
  ArrowLeft,
  Back,
  DropdownDown,
  DropdownUp,
} from 'components/Icons';
import { selectLayerByKey } from 'containers/Map/selectors';
import { decodeInfoView } from 'utils/layers';
import {
  getTopicFromData,
  getTopicsFromData,
  getPreviousTopicFromData,
  getNextTopicFromData,
} from 'utils/policy';
// import CountryChart from './policy/CountryChart';
// import CountryList from './policy/CountryList';
// import SourceList from './policy/SourceList';
// import SourceContent from './policy/SourceContent';
// import CountryFeatureContent from './policy/CountryFeatureContent';
// import FeatureContent from './FeatureContent';
// import Alternates from './Alternates';
// import TitleIconPolicy from './TitleIconPolicy';
// import LayerReference from './LayerReference';
import LayerContent from './LayerContent';
import messages from './messages';

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
    padding: 24px 24px 64px;
  }
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

const BackButton = styled(p => <Button {...p} plain />)`
  padding: 5px;
  position: absolute;
  left: 0;
  top: 0;
`;
const BackText = styled(p => <Text size="medium" {...p} />)`
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
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
`;

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
}) {
  const { locale } = intl;
  const cRef = useRef();
  const [showTopicDrop, setShowTopicDrop] = useState(false);
  useEffect(() => {
    if (cRef && cRef.current) cRef.current.scrollTop = 0;
  }, [view]);
  const [layerId, subView] = decodeInfoView(view);
  const [, indicatorId] = layerId.split('_');

  const topicOptions = getTopicsFromData(layerData);
  const topic = getTopicFromData({ indicatorId, layerData });
  const nextTopic = getNextTopicFromData({ indicatorId, layerData });
  const prevTopic = getPreviousTopicFromData({ indicatorId, layerData });
  const Icon = p => POLICY_TOPIC_ICONS[indicatorId](p.color);

  return (
    <ContentWrap ref={cRef}>
      {config && !subView && topic && (
        <Box>
          <Box align="center" style={{ position: 'relative' }}>
            <BackButton plain onClick={() => onHome()}>
              <Box direction="row" align="center" gap="xsmall">
                <Back size="12px" />
                <BackText>
                  <FormattedMessage {...messages.moduleOverview} />
                </BackText>
              </Box>
            </BackButton>
            <IconWrap>
              <Icon color="white" />
            </IconWrap>
          </Box>
          {(topic.archive === '1' || !onSetTopic || !isModule) && (
            <Box align="center">
              <TitleShort>
                {topic[`short_${locale}`] || topic[`short_${DEFAULT_LOCALE}`]}
              </TitleShort>
            </Box>
          )}
          {topic.archive !== '1' && onSetTopic && isModule && topicOptions && (
            <Box
              margin={{ top: 'small', bottom: 'small' }}
              direction="row"
              justify="between"
              align="center"
            >
              <TopicNav onClick={() => onSetTopic(prevTopic.id)}>
                <ArrowLeft color="" size="24px" />
              </TopicNav>
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
              <TopicNav onClick={() => onSetTopic(nextTopic.id)}>
                <ArrowRight size="24px" />
              </TopicNav>
            </Box>
          )}
        </Box>
      )}
      {config && !subView && (
        <LayerContent fullLayerId={layerId} config={config} />
      )}
    </ContentWrap>
  );
}

PolicyContent.propTypes = {
  view: PropTypes.string,
  config: PropTypes.object,
  layerData: PropTypes.object,
  theme: PropTypes.object,
  intl: intlShape,
  onHome: PropTypes.func,
  onSetTopic: PropTypes.func,
  isModule: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
});

const withConnect = connect(
  mapStateToProps,
  null,
);

export default compose(withConnect)(injectIntl(withTheme(PolicyContent)));
