/**
 *
 * LayerInfo
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

export function FeatureListCollapsable({ title, items }) {
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
      {expand && (
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
    </FeatureListWrap>
  );
}

FeatureListCollapsable.propTypes = {
  items: PropTypes.array,
  title: PropTypes.string,
};

export default FeatureListCollapsable;
