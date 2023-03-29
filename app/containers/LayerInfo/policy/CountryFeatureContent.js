/**
 *
 * LayerInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import { POLICY_TOPIC_ICONS } from 'config';
import { DEFAULT_LOCALE } from 'i18n';

// import { findFeature } from 'utils/layers';
import qe from 'utils/quasi-equals';
import { getIndicatorScoresForCountry } from 'utils/policy';

// import { getPropertyByLocale } from 'containers/Map/utils';

import Title from '../Title';
import messages from '../messages';
// import CountryPolicyCommitments from './CountryPolicyCommitments';
// const ButtonShare = styled(props => <Button plain {...props} />)`
//   color: ${({ theme }) => theme.global.colors.dark};
//   stroke: ${({ theme }) => theme.global.colors.dark};
//   text-decoration: underline;
//   opacity: 0.5;
//   position: relative;
//   top: 3px;
//   &:hover {
//     opacity: 1;
//     color: ${({ theme }) => theme.global.colors.brand};
//     stroke: ${({ theme }) => theme.global.colors.brand};
//   }
// `;
// const StyledTextInput = styled(TextInput)`
//   border: 1px solid #dddddd !important;
//   padding: 3px;
// `;
// const StyledTitle = styled(Title)`
//   margin-bottom: 0;
// `;

const PanelHeader = styled(p => (
  <Box justify="between" {...p} responsive={false} />
))``;

// const PanelBody = styled.div`
//   padding: 12px 12px 96px;
// `;

const IndicatorLinksAKAScoreCard = styled(p => (
  <Box
    direction="row"
    elevation="small"
    pad={{ horizontal: 'xsmall' }}
    {...p}
  />
))``;
const IndicatorLinkWrapper = styled(p => (
  <Box
    margin={{ right: 'xsmall' }}
    elevation={p.active ? 'small' : 'none'}
    {...p}
  />
))`
  position: relative;
  margin-bottom: -6px;
`;

const IndicatorLink = styled(p => <Button plain {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  line-height: 1;
  padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'brand' : 'textSecondary']};
  opacity: 1;
  border-bottom: 6px solid;
  border-color: ${({ theme, active }) =>
    active ? theme.global.colors.brand : 'transparent'};
  padding: 10px;
  &:hover {
    color: ${({ theme }) => theme.global.colors.brandDark};
  }
`;
// const IndicatorLinkAnchor = styled(p => <Text size="xlarge" {...p} />)``;

const TitleWrap = styled(p => (
  <Box margin={{ top: 'small', bottom: 'small' }} {...p} />
))`
  padding: 12px 12px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 12px 0;
  }
`;
const IconWrap = styled.div`
  border-radius: 99999px;
  background: ${({ color, theme }) => color || theme.global.colors.brand};
  padding: 7px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
`;
// const getCountryPath = (info, locale) =>
//   `${window.location.origin}${window.location.pathname}#/${locale}/${
//     ROUTES.POLICY
//   }/?info=${info}`;

const ScoreCardLabel = styled(Text)`
  font-weight: bold;
  text-transform: uppercase;
`;
const ScoreCardSelect = styled(p => <Text size="xsmall" {...p} />)`
  color: ${({ theme }) => theme.global.colors.textSecondary};
`;

export function CountryFeatureContent({
  featureId,
  layerData,
  indicatorId,
  onSetIndicator,
  intl,
}) {
  // const [showLink, setShowLink] = useState(false);
  // const inputRef = useRef();
  // useEffect(() => {
  //   if (inputRef && inputRef.current) {
  //     inputRef.current.select();
  //   }
  // }, [showLink, inputRef]);
  const { locale } = intl;
  if (!featureId || !layerData) return null;
  const country = layerData.data.features.find(f => f.code === featureId);
  if (!country) return null;
  const title = country[`name_${locale}`] || country[`name_${DEFAULT_LOCALE}`];
  const indicatorPositions = getIndicatorScoresForCountry({
    country,
    layerData,
    indicatorId,
  });
  return (
    <PanelHeader>
      <TitleWrap>
        <Title>{title}</Title>
        <Box gap="xsmall">
          <ScoreCardLabel>
            <FormattedMessage {...messages.scoreCardLabel} />
          </ScoreCardLabel>
          <ScoreCardSelect>
            <FormattedMessage {...messages.scoreCardSelect} />
          </ScoreCardSelect>
        </Box>
      </TitleWrap>
      <IndicatorLinksAKAScoreCard>
        {indicatorPositions &&
          indicatorPositions.map(indicator => {
            const Icon = p => POLICY_TOPIC_ICONS[indicator.id](p);
            return (
              <IndicatorLinkWrapper
                key={indicator.id}
                active={qe(indicator.id, indicatorId)}
              >
                <IndicatorLink
                  onClick={() => onSetIndicator(indicator.id)}
                  active={qe(indicator.id, indicatorId)}
                  disabled={qe(indicator.id, indicatorId)}
                >
                  <IconWrap
                    color={
                      layerData.config['styles-by-value'] &&
                      layerData.config['styles-by-value'][
                        indicator.position.value
                      ] &&
                      layerData.config['styles-by-value'][
                        indicator.position.value
                      ].fillColor
                    }
                  >
                    <Icon color="white" size="48px" />
                  </IconWrap>
                </IndicatorLink>
              </IndicatorLinkWrapper>
            );
          })}
      </IndicatorLinksAKAScoreCard>
    </PanelHeader>
  );

  // <IndicatorLink
  //   onClick={() => onSetIndicator('details', layerId)}
  //   active={qe(tab, 'details')}
  //   disabled={qe(tab, 'details')}
  //   label={
  //     <IndicatorLinkAnchor active={qe(tab, 'details')}>
  //       Details
  //     </IndicatorLinkAnchor>
  //   }
  // />
  // const feature = findFeature(layerData.data.features, featureId);
  //
  // if (!feature) return <LayerContent config={config} header={headerFallback} />;
  // return (
  //   <>
  //     <ListItemHeader
  //       supTitle={supTitle}
  //       onClick={() => onSetLayerInfo(config.id, 'countries')}
  //     />
  //     <Box margin={{ bottom: 'large' }}>
  //       <Box
  //         direction="row"
  //         justify="between"
  //         align="center"
  //         margin={{ bottom: 'xsmall' }}
  //       >
  //         <StyledTitle>{getTitle(feature, config, locale)}</StyledTitle>
  //         <ButtonShare
  //           plain
  //           reverse
  //           icon={
  //             showLink ? (
  //               <Close color="inherit" size="large" />
  //             ) : (
  //               <LinkIcon color="inherit" size="xlarge" />
  //             )
  //           }
  //           gap="xsmall"
  //           onClick={() => setShowLink(!showLink)}
  //           title={intl.formatMessage(messages.showCountryLink)}
  //         />
  //       </Box>
  //       {showLink && (
  //         <Box
  //           margin={{ top: 'small', bottom: 'small' }}
  //           justify="start"
  //           align="start"
  //           gap="xsmall"
  //         >
  //           <Text size="xxsmall" color="textSecondary">
  //             <FormattedMessage {...messages.shareCountryLink} />
  //           </Text>
  //           <StyledTextInput
  //             ref={inputRef}
  //             readOnly
  //             focusIndicator
  //             value={getCountryPath(info, locale)}
  //             onFocus={() => {
  //               if (inputRef && inputRef.current) {
  //                 inputRef.current.select();
  //               }
  //             }}
  //           />
  //         </Box>
  //       )}
  //     </Box>
  //     <CountryPolicyCommitments feature={feature} config={config} />
  //   </>
  // );
}
// <FormattedMessage {...messages.downloadPolicyData} />

CountryFeatureContent.propTypes = {
  onLoadLayer: PropTypes.func,
  onSetLayerInfo: PropTypes.func,
  config: PropTypes.object,
  featureId: PropTypes.string,
  locale: PropTypes.string,
  supTitle: PropTypes.string,
  info: PropTypes.string,
  indicatorId: PropTypes.object,
  onSetIndicator: PropTypes.object,
  layerData: PropTypes.object,
  headerFallback: PropTypes.node,
  intl: intlShape.isRequired,
};
export default injectIntl(CountryFeatureContent);
