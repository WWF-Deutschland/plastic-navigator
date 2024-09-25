import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Text } from 'grommet';

import { getCountryStatements, isAggregate } from 'utils/policy';
// import Hint from 'components/Hint';

import CountryPolicySingleStatement from './CountryPolicySingleStatement';

import messages from '../messages';

const Hint = styled(p => <Text size="small" {...p} />)``;

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
  indicator,
  layerInfo,
  onSelectStatement,
}) => {
  const isTopicAggregate = isAggregate(indicator);
  const statements =
    !isTopicAggregate &&
    getCountryStatements({
      countryCode: country.code,
      tables: layerInfo.data.tables,
      topicId: indicator.id,
    });
  return (
    <Styled>
      <StatementListHeader>
        <StatementListHeaderText>
          {statements && statements.length === 1 && (
            <FormattedMessage {...messages.singleStatementCountry} />
          )}
          {(!statements || statements.length !== 1) && (
            <FormattedMessage {...messages.multipleStatementsCountry} />
          )}
        </StatementListHeaderText>
      </StatementListHeader>
      {!isTopicAggregate && (!statements || statements.length === 0) && (
        <NoStatement>
          <Text size="small" color="textSecondary">
            <FormattedMessage {...messages.noStatement} />
          </Text>
        </NoStatement>
      )}
      {!isTopicAggregate &&
        statements &&
        statements.length > 0 &&
        statements.map(statement => (
          <CountryPolicySingleStatement
            key={statement.id}
            statement={statement}
            multiple={statements.length > 1}
            config={layerInfo.config}
            tables={layerInfo.data.tables}
            indicatorId={indicator.id}
            onSelectStatement={onSelectStatement}
          />
        ))}
      {isTopicAggregate && (
        <Hint>
          <FormattedMessage {...messages.noStatementsAggregateTopicHint} />
        </Hint>
      )}
    </Styled>
  );
};

CountryPolicyCommitments.propTypes = {
  country: PropTypes.object,
  layerInfo: PropTypes.object,
  indicator: PropTypes.object,
  onSelectStatement: PropTypes.func,
};

export default CountryPolicyCommitments;
