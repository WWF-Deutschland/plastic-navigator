import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';

import DEFAULT_LOCALE from 'i18n';

import Gradient from './Gradient';
import Circles from './Circles';

const Styled = styled(p => <Box {...p} fill />)`
  position: relative;
`;

const Title = styled(Text)``;

export function KeyFull({ config, id, simple, intl, dark, range }) {
  const { key, render, style } = config;
  const { locale } = intl;
  const isGradient = key && key.stops && key.type === 'continuous';
  const isCircle = key && render && render.type === 'scaledCircle' && !!style;
  return (
    <Styled>
      {key && key.title && (
        <Title>{key.title[locale] || key.title[DEFAULT_LOCALE]}</Title>
      )}
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
    </Styled>
  );
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
