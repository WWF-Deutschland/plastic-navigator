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
import { Next } from 'grommet-icons';

import { setLayerInfo } from 'containers/App/actions';

const ListTitle = styled(p => <Heading level={4} {...p} />)``;

const FeatureListWrap = styled(Box)``;

const FeatureButton = styled(p => (
  <Button {...p} plain fill="horizontal" alignSelf="start" />
))`
  border-top: 1px solid;
`;

export function FeatureList({ title, items, layerId, onSetLayerInfo }) {
  return (
    <FeatureListWrap>
      <ListTitle>{title}</ListTitle>
      {items.map(item => (
        <FeatureButton
          key={item.id}
          onClick={() => onSetLayerInfo(layerId, item.id)}
          label={
            <Box direction="row" justify="between" pad="small">
              <Text>{item.label}</Text>
              <Next />
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
