/**
 *
 * LayerInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button, Box, Heading, Text } from 'grommet';
import { ArrowRightL } from 'components/Icons';
import { deburr } from 'lodash/string';

import { setLayerInfo } from 'containers/App/actions';

const ListTitle = styled(p => <Heading level={2} {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  font-size: 24px;
  line-height: 1;
  font-weight: normal;
  margin-bottom: 20px;
`;

const FeatureListWrap = styled(Box)``;

const FeatureButton = styled(p => (
  <Button {...p} plain fill="horizontal" alignSelf="start" />
))`
  border-top: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  &:hover {
    background: ${({ theme }) => theme.global.colors.light};
  }
  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  }
`;

export function FeatureList({ title, items, layerId, onSetLayerInfo }) {
  const sorted = items.sort((a, b) =>
    deburr(a.label) > deburr(b.label) ? 1 : -1,
  );
  return (
    <FeatureListWrap>
      <ListTitle>{title}</ListTitle>
      {sorted.map(item => (
        <FeatureButton
          key={item.id}
          onClick={() => onSetLayerInfo(layerId, item.id)}
          label={
            <Box
              direction="row"
              justify="between"
              pad={{ vertical: 'small', right: 'small', left: 'small' }}
              align="center"
              responsive={false}
            >
              <Text>{item.label}</Text>
              <ArrowRightL />
            </Box>
          }
        />
      ))}
    </FeatureListWrap>
  );
}

FeatureList.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  items: PropTypes.array,
  layerId: PropTypes.string,
  title: PropTypes.string,
};

function mapDispatchToProps(dispatch) {
  return {
    onSetLayerInfo: (id, location) => {
      dispatch(setLayerInfo(id, location));
    },
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(FeatureList);
