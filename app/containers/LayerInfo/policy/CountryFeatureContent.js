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

import MarkdownText from 'components/MarkdownText';
import CountryPositionSymbol from './CountryPositionSymbol';
import CountryPolicyCommitments from './CountryPolicyCommitments';

import Title from '../Title';
import PanelBody from '../PanelBody';
import messages from '../messages';

const PanelHeader = styled(p => (
  <Box justify="between" {...p} responsive={false} />
))``;
const TitleWrap = styled(p => (
  <Box margin={{ top: 'small', bottom: 'small' }} {...p} />
))`
  padding: 12px 24px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 24px 0;
  }
`;
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

const CountryPositionLabel = styled(p => <Text size="xsmall" {...p} />)`
  font-weight: bold;
  text-transform: uppercase;
`;
const IndicatorTitle = styled(p => <Text size="xxlarge" {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  line-height: 1;
  text-transform: uppercase;
`;
const IndicatorDescription = styled(p => <MarkdownText {...p} />)``;

export function CountryFeatureContent({
  featureId,
  layerInfo,
  indicatorId,
  onSetIndicator,
  intl,
  onSelectStatement,
}) {
  // const [showLink, setShowLink] = useState(false);
  // const inputRef = useRef();
  // useEffect(() => {
  //   if (inputRef && inputRef.current) {
  //     inputRef.current.select();
  //   }
  // }, [showLink, inputRef]);
  const { locale } = intl;
  if (!featureId || !layerInfo) return null;
  const country = layerInfo.data.features.find(f => f.code === featureId);
  if (!country) return null;
  const title = country[`name_${locale}`] || country[`name_${DEFAULT_LOCALE}`];
  const indicatorPositions = getIndicatorScoresForCountry({
    country,
    layerInfo,
    indicatorId,
  });
  const currentIndicator =
    indicatorPositions && indicatorPositions.find(i => qe(i.id, indicatorId));
  return (
    <>
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
                        layerInfo.config['styles-by-value'] &&
                        layerInfo.config['styles-by-value'][
                          indicator.position.value
                        ] &&
                        layerInfo.config['styles-by-value'][
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
      <PanelBody hasHeader>
        {currentIndicator && (
          <>
            <Box gap="small">
              <IndicatorTitle>
                {currentIndicator[`short_${locale}`] ||
                  currentIndicator[`short_${DEFAULT_LOCALE}`]}
              </IndicatorTitle>
              <IndicatorDescription
                content={
                  currentIndicator[`description_${locale}`] ||
                  currentIndicator[`description_${DEFAULT_LOCALE}`]
                }
              />
            </Box>
            {currentIndicator && currentIndicator.position && (
              <Box gap="xsmall" margin={{ top: 'medium' }}>
                <CountryPositionLabel>
                  <FormattedMessage {...messages.latestPositionLabel} />
                </CountryPositionLabel>
                <Box
                  direction="row"
                  justify="start"
                  gap="small"
                  align="center"
                  margin={{
                    horizontal: 'small',
                  }}
                >
                  <CountryPositionSymbol
                    position={currentIndicator.position}
                    config={layerInfo.config}
                    inKey={false}
                  />
                  <Box flex={{ grow: 1, shrink: 1 }}>
                    {currentIndicator.position.latestPosition && (
                      <MarkdownText
                        content={
                          currentIndicator.position.latestPosition[
                            `position_${locale}`
                          ] ||
                          currentIndicator.position.latestPosition[
                            `position_${DEFAULT_LOCALE}`
                          ]
                        }
                        format
                        formatValues={{ isSingle: true }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        <CountryPolicyCommitments
          country={country}
          layerInfo={layerInfo}
          indicatorId={indicatorId}
          onSelectStatement={onSelectStatement}
        />
      </PanelBody>
    </>
  );
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
  indicatorId: PropTypes.string,
  onSetIndicator: PropTypes.func,
  onSelectStatement: PropTypes.func,
  layerInfo: PropTypes.object,
  headerFallback: PropTypes.node,
  intl: intlShape.isRequired,
};
export default injectIntl(CountryFeatureContent);
