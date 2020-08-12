import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Text, Button } from 'grommet';
import { DEFAULT_LOCALE } from 'i18n';

import { KeyArea } from 'components/KeyArea';

import messages from './messages';

const Styled = styled.div``;
const StyledButton = styled(p => (
  <Button plain as="a" target="_blank" {...p} />
))`
  text-decoration: underline;
`;

const Quote = styled.blockquote`
  font-style: italic;
`;

const IconImgWrap = styled.div`
  width: ${({ size }) => size.x}px;
`;
const AreaWrap = styled.div`
  width: 30px;
  height: 30px;
  position: relative;
`;

const IconImg = styled.img`
  width: 100%;
`;

const getSquareStyle = (config, position) => {
  if (
    config.render &&
    config.render.type === 'area' &&
    config.featureStyle &&
    config.featureStyle.property
  ) {
    const ps = config.featureStyle.property.split('.');
    const positionValue = position[ps[1]];
    const style = Object.keys(config.featureStyle.style).reduce(
      (styleMemo, attr) => {
        const attrObject = config.featureStyle.style[attr];
        // prettier-ignore
        const attrValue =
          attrObject[positionValue] ||
          attrObject.default ||
          attrObject.none ||
          attrObject.without ||
          attrObject['0'];
        return {
          ...styleMemo,
          [attr]: attrValue,
        };
      },
      {},
    );
    return {
      stroke: true,
      weight: 1,
      fill: true,
      fillOpacity: 0.4,
      ...style,
    };
  }
  return null;
};

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
  const iconuri =
    config.icon &&
    config.icon.datauri &&
    (config.icon.datauri.default || config.icon.datauri);
  const iconsize = { x: 50, y: 50 };
  // console.log(config, feature)
  // console.log(getVectorGridStyle(feature.properties, config))
  // const square =
  return (
    <Styled>
      {positions.length > 1 && (
        <Text size="small">
          <FormattedMessage {...messages.multiplePositions} />
        </Text>
      )}
      {sorted.map(position => {
        const icon = iconuri && iconuri[position.position_id];
        const square = getSquareStyle(config, position);
        return (
          <div key={`${position.position_id}${position.source_id}`}>
            <hr />
            {position.position && (
              <div>
                {icon && (
                  <IconImgWrap size={iconsize}>
                    <IconImg src={icon} />
                  </IconImgWrap>
                )}
                {square && (
                  <AreaWrap>
                    <KeyArea areaStyles={[square]} />
                  </AreaWrap>
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
                  <StyledButton
                    href={position.source.url}
                    label={
                      <Text size="small">
                        <FormattedMessage {...messages.sourceLinkExternal} />
                        {` (${position.source_id})`}
                      </Text>
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
