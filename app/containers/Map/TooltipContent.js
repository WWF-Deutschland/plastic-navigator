import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
// import { Box } from 'grommet';

import asArray from 'utils/as-array';
import { getPropertyByLocale } from './utils';

const Styled = styled.div``;

const getContent = (feature, config, layer, locale) => {
  if (config.tooltip.content.propertyByLocale) {
    return getPropertyByLocale(layer, config.tooltip.content, locale);
  }
  if (config.tooltip.content.propertyFromLayer) {
    return getPropertyByLocale(
      feature.properties,
      config.tooltip.content,
      locale,
    );
  }
  return config.tooltip.content[locale];
};

const TooltipContent = ({ config, feature, intl, layer }) => {
  const { icon, tooltip } = config;
  const { locale } = intl;
  console.log(icon, tooltip, config, layer);
  return (
    <Styled>
      {asArray(getContent(feature, config, layer, locale)).map(c => (
        <p>{c}</p>
      ))}
    </Styled>
  );
};

TooltipContent.propTypes = {
  config: PropTypes.object,
  feature: PropTypes.object,
  layer: PropTypes.object,
  intl: intlShape.isRequired,
  // onClose: PropTypes.func,
};

export default injectIntl(TooltipContent);
