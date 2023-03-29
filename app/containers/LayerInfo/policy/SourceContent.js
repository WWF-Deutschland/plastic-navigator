/**
 *
 * LayerInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box } from 'grommet';

import { DEFAULT_LOCALE } from 'i18n';

import Title from '../Title';

const TitleWrap = styled(p => (
  <Box margin={{ top: 'small', bottom: 'small' }} {...p} />
))`
  padding: 12px 12px 0;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 24px 12px 0;
  }
`;
const PanelHeader = styled(p => (
  <Box justify="between" {...p} responsive={false} />
))``;

export function SourceContent({
  sourceId,
  // indicatorId,
  layerData,
  // onSetIndicator,
  intl,
}) {
  const { locale } = intl;
  if (!sourceId || !layerData) return null;
  const source = layerData.data.tables.sources.data.data.find(
    s => s.id === sourceId,
  );
  if (!source) return null;

  const title = source[`title_${locale}`] || source[`title_${DEFAULT_LOCALE}`];
  return (
    <PanelHeader>
      <TitleWrap>
        <Title>{title}</Title>
      </TitleWrap>
    </PanelHeader>
  );
}
// const feature = findFeature(layerData.data.features, featureId);
// if (!feature) return <LayerContent config={config} />;
// const [, xSourceId] = sourceId.split('source-');
// const sources = getSourcesFromCountryFeaturesWithPosition(
//   config,
//   excludeCountryFeatures(config, layerData.data.features),
//   locale,
// );
// const source = sources[xSourceId];
// return (
//   <>
//     <ListItemHeader
//       supTitle={supTitle}
//       onClick={() => onSetLayerInfo(config.id, 'sources')}
//     />
//     <Title wide>{source.label || source.id}</Title>
//     {source && (
//       <CountryPolicySinglePosition
//         source={source}
//         position={source.position}
//         config={config}
//         listCountries
//       />
//     )}
//   </>
// );
// <Title>{getTitle(feature, config, locale)}</Title>
// <CountryPolicyCommitments feature={feature} config={config} />

SourceContent.propTypes = {
  sourceId: PropTypes.string,
  layerData: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(SourceContent);
