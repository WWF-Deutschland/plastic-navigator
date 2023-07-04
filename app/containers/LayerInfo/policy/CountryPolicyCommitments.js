import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Text } from 'grommet';

import { getCountryStatements } from 'utils/policy';
import CountryPolicySingleStatement from './CountryPolicySingleStatement';

import messages from '../messages';

const Styled = styled.div``;

const StatementListHeader = styled.div`
  border-bottom: 1px solid;
  margin-top: 45px;
  margin-bottom: 20px;
  padding-bottom: 5px;
`;
const NoStatement = styled.div`
  margin-top: 15px;
  margin-bottom: 10px;
`;

const StatementListHeaderText = styled(p => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

const CountryPolicyCommitments = ({
  country,
  indicatorId,
  layerInfo,
  onSelectStatement,
}) => {
  const statements = getCountryStatements({
    countryCode: country.code,
    tables: layerInfo.data.tables,
    topicId: indicatorId,
  });
  return (
    <Styled>
      <StatementListHeader>
        <StatementListHeaderText>
          {statements && statements.length === 1 && (
            <FormattedMessage {...messages.singleStatement} />
          )}
          {(!statements || statements.length !== 1) && (
            <FormattedMessage {...messages.multipleStatementsCountry} />
          )}
        </StatementListHeaderText>
      </StatementListHeader>
      {(!statements || statements.length === 0) && (
        <NoStatement>
          <Text size="small" color="textSecondary">
            <FormattedMessage {...messages.noStatement} />
          </Text>
        </NoStatement>
      )}
      {statements &&
        statements.length > 0 &&
        statements.map(statement => (
          <CountryPolicySingleStatement
            key={statement.id}
            statement={statement}
            multiple={statements.length > 1}
            config={layerInfo.config}
            tables={layerInfo.data.tables}
            indicatorId={indicatorId}
            onSelectStatement={onSelectStatement}
          />
        ))}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  country: PropTypes.object,
  layerInfo: PropTypes.object,
  indicatorId: PropTypes.string,
  onSelectStatement: PropTypes.func,
};

export default CountryPolicyCommitments;
