import React from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import { Box } from 'grommet';

import { POLICY_TOPIC_ICONS } from 'config';

const Styled = styled(p => <Box flex={false} {...p} />)`
  margin: 0 auto;
`;

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;

export function TopicsSymbol({ topicId, theme }) {
  const Icon = p => POLICY_TOPIC_ICONS[topicId](p);
  return (
    <Styled isLarge>
      <AreaWrap>
        <Icon color={theme.global.colors.brand} />
      </AreaWrap>
    </Styled>
  );
}

TopicsSymbol.propTypes = {
  theme: PropTypes.object,
  topicId: PropTypes.number,
};

export default withTheme(TopicsSymbol);
