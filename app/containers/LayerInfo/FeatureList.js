/**
 *
 * LayerInfo
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button, Box, Heading, Text } from 'grommet';

import { ArrowRightL, ArrowDown, ArrowUp } from 'components/Icons';

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
const ListTitleCollapsable = styled(ListTitle)`
  margin: 0 !important;
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

const TitleButton = styled(Button)`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors.dark};
`;

const IconWrap = styled(p => <Box {...p} responsive={false} />)`
  padding: ${({ theme }) => theme.global.edgeSize.small};
  margin-left: ${({ stretch }) => (stretch ? 'auto' : 0)};
  border-radius: 9999px;
  background: ${({ theme, over, expand }) =>
    over || expand ? theme.global.colors.light : 'transparent'};
`;

export function FeatureList({
  title,
  items,
  layerId,
  onSetLayerInfo,
  collapsable,
  config,
}) {
  const [expand, setExpand] = useState(false);
  const [over, setOver] = useState(false);

  return (
    <FeatureListWrap>
      {collapsable && (
        <TitleButton
          plain
          reverse
          onClick={() => setExpand(!expand)}
          onMouseOver={() => setOver(true)}
          onFocus={() => setOver(true)}
          onMouseOut={() => setOver(false)}
          onBlur={() => setOver(false)}
          label={
            <Box
              justify="between"
              direction="row"
              pad={{ top: 'small', bottom: 'edge', left: 'xsmall' }}
              align="center"
              responsive={false}
            >
              <ListTitleCollapsable>{title}</ListTitleCollapsable>
              <IconWrap over={over} expand={expand}>
                {expand ? <ArrowUp /> : <ArrowDown />}
              </IconWrap>
            </Box>
          }
        />
      )}
      {!collapsable && <ListTitle>{title}</ListTitle>}
      {(expand || !collapsable) && (
        <Box>
          {items.map(item => (
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
                  <Box direction="row" justify="start" gap="small">
                    {item.position && config && (
                      <CountryPositionSymbol
                        position={item.position}
                        config={config}
                      />
                    )}
                    <Text>{item.label}</Text>
                  </Box>
                  <ArrowRightL />
                </Box>
              }
            />
          ))}
        </Box>
      )}
    </FeatureListWrap>
  );
}

FeatureList.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  items: PropTypes.array,
  config: PropTypes.object,
  layerId: PropTypes.string,
  title: PropTypes.string,
  collapsable: PropTypes.bool,
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
