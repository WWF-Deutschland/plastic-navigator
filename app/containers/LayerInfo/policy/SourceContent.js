/**
 *
 * LayerInfo
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

import {
  excludeCountryFeatures,
  getSourcesFromCountryFeaturesWithPosition,
} from './utils';

import CountryPolicySinglePosition from './CountryPolicySinglePosition';
import ListItemHeader from '../ListItemHeader';
import Title from '../Title';

export function SourceContent({
  sourceId,
  indicatorId,
  onSetIndicator,
  layerData,
  onClose,
  intl,
}) {
  const { locale } = intl;

  console.log(sourceId)
  console.log(indicatorId)
  console.log(layerData)
  if (!sourceId || !layerData) return null;
  return null;
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
}
// <Title>{getTitle(feature, config, locale)}</Title>
// <CountryPolicyCommitments feature={feature} config={config} />

SourceContent.propTypes = {
  onLoadLayer: PropTypes.func,
  onSetLayerInfo: PropTypes.func,
  config: PropTypes.object,
  sourceId: PropTypes.string,
  supTitle: PropTypes.string,
  layerData: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(SourceContent);
