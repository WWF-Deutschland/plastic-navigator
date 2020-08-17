import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';

import { DEFAULT_LOCALE } from 'i18n';

import messages from './messages';

const Styled = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h3``;

const Reference = styled.div``;
const Author = styled.span``;
const Year = styled.span``;
const URL = styled.a``;
const Study = styled.span`
  text-decoration: underline;
`;
const Publication = styled.span`
  font-style: italic;
`;

export function LayerReference({ attribution, intl }) {
  const { author, year, title, publication, url } = attribution;
  const locale = intl.locale || DEFAULT_LOCALE;
  return (
    <Styled className="mpx-reference">
      <Title>
        <FormattedMessage {...messages.titleReference} />
      </Title>
      <Reference>
        {author && <Author>{author[locale] || author}</Author>}
        {year && <Year> ({year})</Year>}
        {'. '}
        {title && url && (
          <URL target="_blank" href={url}>
            {title[locale] || title}
          </URL>
        )}
        {title && !url && <Study>{title[locale] || title}</Study>}
        {title && <span>. </span>}
        {publication && (
          <Publication>{publication[locale] || publication}</Publication>
        )}
        {!title && url && (
          <URL target="_blank" href={url}>
            {url}
          </URL>
        )}
      </Reference>
    </Styled>
  );
}

LayerReference.propTypes = {
  attribution: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(LayerReference);
