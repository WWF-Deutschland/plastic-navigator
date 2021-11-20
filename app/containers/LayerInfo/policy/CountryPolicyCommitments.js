import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Text } from 'grommet';

import { sortPositions } from './utils';
import CountryPolicySinglePosition from './CountryPolicySinglePosition';

import messages from '../messages';

const Styled = styled.div``;

const MultipleWrap = styled.div`
  margin-bottom: 10px;
`;

const CountryPolicyCommitments = ({ config, feature }) => {
  const { positions } = feature.properties;
  if (!positions || positions.length < 1) return null;
  const sorted = sortPositions(positions, config);

  // prettier-ignore
  return (
    <Styled>
      {positions.length > 1 && (
        <MultipleWrap>
          <Text size="xsmall" color="textSecondary">
            <FormattedMessage {...messages.multiplePositions} />
          </Text>
        </MultipleWrap>
      )}
      {sorted.map(position => (
        <CountryPolicySinglePosition
          key={`${position.position_id}${position.source_id}`}
          position={position}
          source={position.source}
          multiple={positions.length > 1}
          config={config}
        />
      ))}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  config: PropTypes.object, // the layer configuration
  feature: PropTypes.object, // the feature
};

export default CountryPolicyCommitments;
