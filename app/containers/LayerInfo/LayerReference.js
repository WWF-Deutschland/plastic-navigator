import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import messages from './messages';

const Styled = styled.div`
  margin-bottom: 30px;
  font-size: 0.8em;
`;

const Title = styled.h3``;

const Reference = styled.div``;
const Author = styled.span``;
const Year = styled.span``;
const Study = styled.span`
  text-decoration: underline;
`;
const Publication = styled.span`
  font-style: italic;
`;
const URL = styled.a``;

export function LayerReference({ attribution }) {
  const { author, year, title, publication, url } = attribution;
  return (
    <Styled>
      <Title>
        <FormattedMessage {...messages.titleReference} />
      </Title>
      <Reference>
        {author && <Author>{author}</Author>}
        {year && <Year> ({year})</Year>}
        {'. '}
        {title && <Study>{title}</Study>}
        {title && <span>. </span>}
        {publication && <Publication>{publication}</Publication>}
        {publication && <span>. </span>}
        {url && (
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
};

export default LayerReference;
