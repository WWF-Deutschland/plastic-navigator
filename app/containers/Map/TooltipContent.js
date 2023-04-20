import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
// import { Box } from 'grommet';

import asArray from 'utils/as-array';
import { getPropertyByLocale } from './utils';
// import messages from './messages';

const Styled = styled.div``;

const P = styled.p`
  margin-top: 0;
  font-size: 13px;
`;

const getContent = (feature, element, layer, locale) => {
  if (layer && element.propertyFromLayer) {
    return getPropertyByLocale(layer, element, locale);
  }
  if (feature.properties && element.propertyByLocale) {
    return getPropertyByLocale(feature.properties, element, locale);
  }
  return element[locale];
};

const TooltipContent = ({ config, feature, intl, layer, content }) => {
  const { locale } = intl;
  if (content && content !== '') {
    return (
      <Styled>
        <P>{content}</P>
      </Styled>
    );
  }
  if (config) {
    const { tooltip } = config;
    const contentList = asArray(
      getContent(feature, tooltip.content, layer, locale),
    ).map((contentItem, key) => ({
      key,
      content: contentItem,
    }));
    return (
      <Styled>
        {contentList.map(c => (
          <P key={c.key}>{c.content}</P>
        ))}
      </Styled>
    );
  }
  return null;
};

TooltipContent.propTypes = {
  config: PropTypes.object, // the layer configuration
  feature: PropTypes.object, // the feature
  layer: PropTypes.object, // optionally the features' layer information
  content: PropTypes.string, // optionally the features' layer information
  intl: intlShape.isRequired,
};

export default injectIntl(TooltipContent);
