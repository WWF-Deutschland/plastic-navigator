import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Button } from 'grommet';
import { DEFAULT_LOCALE } from 'i18n';
import messages from './messages';

const Styled = styled.div``;

const Quote = styled.blockquote`
  font-style: italic;
`;

const IconImgWrap = styled.div`
  width: ${({ size }) => size.x}px;
`;

const IconImg = styled.img`
  width: 100%;
`;

const CountryPolicyCommitments = ({ config, feature, intl }) => {
  const { locale } = intl;
  const { positions } = feature.properties;
  if (!positions || positions.length < 0) return null;
  const sorted = positions.sort((a, b) => {
    const aDate = a.source && a.source.date && new Date(a.source.date);
    const bDate = b.source && b.source.date && new Date(b.source.date);
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    if (aDate > bDate) return -1;
    return 1;
  });
  console.log(config);
  return (
    <Styled>
      {positions.length > 1 && (
        <FormattedMessage {...messages.multiplePositions} />
      )}
      {sorted.map(position => {
        const icon = config.icon.datauri[position.position_id];
        console.log(icon);
        return (
          <div key={`${position.position_id}${position.source_id}`}>
            <hr />
            {position.position && (
              <div>
                <FormattedMessage {...messages.position} />
                {icon && (
                  <IconImgWrap size={config.icon.size}>
                    <IconImg src={icon} />
                  </IconImgWrap>
                )}
                <p>
                  {position.position[`position_${locale}`] ||
                    position.position[`position_${DEFAULT_LOCALE}`]}
                </p>
              </div>
            )}
            {position.source && (
              <div>
                <div>
                  <FormattedMessage {...messages.source} />
                </div>
                <p>
                  {position.source[`source_${locale}`] ||
                    position.source[`source_${DEFAULT_LOCALE}`]}
                </p>
                {position.source.date && (
                  <div>
                    <FormattedDate value={new Date(position.source.date)} />
                  </div>
                )}
                {position.source[`quote_${locale}`] && (
                  <Quote>
                    {position.source[`quote_${locale}`] ||
                      position.source[`quote_${DEFAULT_LOCALE}`]}
                  </Quote>
                )}
                {position.source.url && (
                  <Button
                    plain
                    as="a"
                    href={position.source.url}
                    target="_blank"
                    label={
                      <>
                        <FormattedMessage {...messages.sourceLinkExternal} />
                        {` (${position.source_id})`}
                      </>
                    }
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  config: PropTypes.object, // the layer configuration
  feature: PropTypes.object, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(CountryPolicyCommitments);
