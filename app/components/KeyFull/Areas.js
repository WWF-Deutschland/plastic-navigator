import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';

import { DEFAULT_LOCALE } from 'i18n';

import asArray from 'utils/as-array';

import KeyArea from 'components/KeyArea';

// import messages from './messages';

const SquareLabelWrap = styled(p => (
  <Box direction="row" align="center" gap="xsmall" {...p} />
))``;
const KeyLabel = styled(p => <Text size="small" {...p} />)``;
// const Hint = styled(p => <Text size="small" {...p} />)`
//   font-style: italic;
// `;

const KeyAreaWrap = styled(p => <Box flex={{ shrink: 0 }} {...p} />)`
  position: relative;
  width: 16px;
  height: 16px;
`;

export function Areas({ config, intl, title }) {
  const { key, featureStyle } = config;
  const { locale } = intl;
  let square = { style: { color: 'black' }, title, id: config.id };
  if (featureStyle.multiple === 'true') {
    square = key.values.map(val => {
      let t;
      if (key.title && key.title[val]) {
        t =
          key.title[val][locale] ||
          key.title[val][DEFAULT_LOCALE] ||
          key.title[val];
      }
      let style;
      if (featureStyle && featureStyle.style) {
        style = Object.keys(featureStyle.style).reduce(
          (memo, attr) => ({
            ...memo,
            [attr]: featureStyle.style[attr][val],
          }),
          {},
        );
      }
      return {
        id: val,
        style,
        title: t,
      };
    });
  }
  return (
    <Box gap="xsmall">
      {asArray(square).map(sq => (
        <SquareLabelWrap key={sq.id}>
          <KeyAreaWrap>
            <KeyArea areaStyles={[sq.style]} />
          </KeyAreaWrap>
          <KeyLabel>{sq.title}</KeyLabel>
        </SquareLabelWrap>
      ))}
    </Box>
  );
}

Areas.propTypes = {
  config: PropTypes.object,
  title: PropTypes.string,
  // simple: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Areas);
