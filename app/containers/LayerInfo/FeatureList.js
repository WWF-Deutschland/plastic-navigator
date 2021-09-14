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

import { setLayerInfo } from 'containers/App/actions';
import CountryPositionSymbol from './CountryPositionSymbol';

const ListTitle = styled(p => <Heading level={4} {...p} />)`
  font-family: 'wwfregular';
  letter-spacing: 0.1px;
  font-size: 24px;
  line-height: 1;
  margin-bottom: 15px;
  font-weight: normal;
`;

const FeatureListWrap = styled(Box)`
  margin-top: 30px;
`;

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

export function FeatureList({
  title,
  items,
  layerId,
  onSetLayerInfo,
  config,
  isSourceList,
}) {
  const sorted = items.sort((a, b) =>
    (a.label || a.id) > (b.label || b.id) ? 1 : -1,
  );

  return (
    <FeatureListWrap>
      <ListTitle>{title}</ListTitle>
      <Box>
        {sorted.map(item => (
          <FeatureButton
            key={item.id}
            onClick={() =>
              isSourceList
                ? onSetLayerInfo(layerId, `source-${item.id}`)
                : onSetLayerInfo(layerId, item.id)
            }
            label={
              <Box
                direction="row"
                justify="between"
                pad={{ vertical: 'small', right: 'small', left: 'small' }}
                align="center"
                responsive={false}
              >
                <Box direction="row" justify="start" gap="small">
                  {item.position && config && (
                    <CountryPositionSymbol
                      position={item.position}
                      config={config}
                    />
                  )}
                  <Text>{item.label || item.id}</Text>
                </Box>
                <ArrowRightL />
              </Box>
            }
          />
        ))}
      </Box>
    </FeatureListWrap>
  );
}

FeatureList.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  items: PropTypes.array,
  config: PropTypes.object,
  layerId: PropTypes.string,
  title: PropTypes.string,
  isSourceList: PropTypes.bool,
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
