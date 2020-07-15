import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import DEFAULT_LOCALE from 'i18n';

import Gradient from './Gradient';
import Circles from './Circles';
import Icon from './Icon';

import messages from './messages';

const Styled = styled(p => <Box {...p} fill />)`
  position: relative;
`;

const Title = styled(Text)``;

export function KeyFull({ config, id, simple, intl, dark, range }) {
  const { key, render, style, data, icon } = config;
  const { locale } = intl;
  const isGradient = key && key.stops && key.type === 'continuous';
  const isCircle = key && render && render.type === 'scaledCircle' && !!style;
  const isIcon =
    (key && key.icon && !!key.icon.datauri) ||
    (render && render.type === 'marker' && !!icon.datauri);
  /* eslint-disable react/no-danger */
  return (
    <Styled>
      <div>
        {key && key.title && !isIcon && (
          <Title>
            {`${key.title[locale] || key.title[DEFAULT_LOCALE]} `}
            {simple &&
              data.type &&
              ` ${intl.formatMessage(messages[`by-${config.data.type}`])} `}
          </Title>
        )}
        {!simple && data && data.unit && (
          <Text>
            <FormattedMessage {...messages['in-unit']} />
            <span
              dangerouslySetInnerHTML={{
                __html: ` ${data.unit[locale] || data.unit[DEFAULT_LOCALE]}${
                  data['unit-additional'] ? '<sup>*</sup> ' : ' '
                }`,
              }}
            />
          </Text>
        )}
      </div>
      {isIcon && <Icon id={id} config={config} simple={simple} dark={dark} />}
      {isGradient && (
        <Gradient id={id} config={config} simple={simple} dark={dark} />
      )}
      {isCircle && (
        <Circles
          id={id}
          config={config}
          simple={simple}
          dark={dark}
          range={range}
        />
      )}
      {!simple && data && data.unit && data['unit-additional'] && (
        <div>
          <Text
            size="xsmall"
            dangerouslySetInnerHTML={{
              __html: `<sup>*</sup> ${data['unit-additional'][locale] ||
                data['unit-additional'][DEFAULT_LOCALE]}`,
            }}
          />
        </div>
      )}
    </Styled>
  );
  /* eslint-enable react/no-danger */
}

KeyFull.propTypes = {
  config: PropTypes.object,
  id: PropTypes.string,
  simple: PropTypes.bool,
  dark: PropTypes.bool,
  range: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(KeyFull);
