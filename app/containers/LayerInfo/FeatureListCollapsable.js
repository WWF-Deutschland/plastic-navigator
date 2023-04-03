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

import { setItemInfo } from 'containers/App/actions';
import { Button, Box, Heading, Text } from 'grommet';

import { ArrowDown, ArrowUp } from 'components/Icons';
import { sortLabels } from 'utils/string';

const ListTitleCollapsable = styled(p => <Heading level="5" {...p} />)`
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 8px;
`;

const FeatureListWrap = styled(Box)`
  margin: 30px 0 50px;
`;
const FeatureButton = styled(p => (
  <Button {...p} plain fill="horizontal" alignSelf="start" />
))`
  &:hover {
    text-decoration: underline;
  }
`;
const TitleButton = styled(Button)`
  border-bottom: 1px solid ${({ theme }) => theme.global.colors.dark};
`;

const IconWrap = styled(p => <Box {...p} responsive={false} />)`
  padding: ${({ theme }) => theme.global.edgeSize.xsmall};
  margin-left: ${({ stretch }) => (stretch ? 'auto' : 0)};
  border-radius: 9999px;
  background: ${({ theme, over, expand }) =>
    over || expand ? theme.global.colors.light : 'transparent'};
`;

export function FeatureListCollapsable({
  title,
  items,
  layerId,
  isSourceList,
  onSetItemInfo,
}) {
  const [expand, setExpand] = useState(false);
  const [over, setOver] = useState(false);
  const sorted = items.sort((a, b) =>
    sortLabels(a.label || a.id, b.label || b.id),
  );
  return (
    <FeatureListWrap>
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
            pad={{ top: 'small', bottom: 'edge', left: 'hair' }}
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
      {expand && sorted.lenght > 0 && (
        <Box>
          {sorted.map(item => (
            <Box
              key={item.id}
              direction="row"
              justify="between"
              pad={{ vertical: 'xsmall', horizontal: 'hair' }}
              align="center"
              responsive={false}
            >
              <Box direction="row" justify="start" gap="small">
                <Text>{item.label}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {expand && sorted.length > 0 && (
        <Box>
          {sorted.map(item => (
            <FeatureButton
              key={item.id}
              onClick={() =>
                isSourceList
                  ? onSetItemInfo(`${layerId}|source-${item.id}`)
                  : onSetItemInfo(`${layerId}|country-${item.id}`)
              }
              label={
                <Box margin={{ vertical: 'xsmall' }}>
                  <Text>{item.label || item.id}</Text>
                </Box>
              }
            />
          ))}
        </Box>
      )}
    </FeatureListWrap>
  );
}

FeatureListCollapsable.propTypes = {
  items: PropTypes.array,
  title: PropTypes.string,
  layerId: PropTypes.string,
  isSourceList: PropTypes.bool,
  onSetItemInfo: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    onSetItemInfo: id => {
      dispatch(setItemInfo(id));
    },
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(FeatureListCollapsable);
