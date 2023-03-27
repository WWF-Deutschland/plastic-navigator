import qe from 'utils/quasi-equals';

export const getCountryStatements = ({
  countryCode,
  tables,
  date,
  topicId,
}) => {
  const countryStatementIds =
    tables &&
    tables['country-sources'] &&
    tables['country-sources'].data.data
      .filter(cs => qe(cs.country_code, countryCode))
      .map(cs => cs.source_id);
  let countryStatements =
    countryStatementIds &&
    tables.sources &&
    countryStatementIds.map(id =>
      tables.sources.data.data.find(s => qe(id, s.id)),
    );
  if (date) {
    countryStatements = countryStatements.filter(
      s => new Date(s.date).getTime() < date,
    );
  }
  if (topicId) {
    countryStatements = countryStatements.filter(
      s => s[`position_t${topicId}`] && s[`position_t${topicId}`].trim() !== '',
    );
  }
  return countryStatements;
};

export const getLatestCountryPositionStatement = ({
  countryStatements,
  topicId,
}) => {
  const latestStatement = countryStatements.sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    // chaeck value when dates are equal
    if (a.date === b.date) {
      const aValue = parseInt(a[`position_t${topicId}`], 10);
      const bValue = parseInt(b[`position_t${topicId}`], 10);
      return aValue < bValue ? 1 : -1; // higher values first
    }
    return aDate < bDate ? 1 : -1;
  })[0];
  return {
    statement: latestStatement,
    value: parseInt(latestStatement[`position_t${topicId}`], 10),
  };
};
export const getStrongestCountryPositionStatement = ({
  countryStatements,
  topicId,
}) => {
  const strongestStatement = countryStatements.reduce((memo, statement) => {
    if (memo) {
      const sValue = parseInt(statement[`position_t${topicId}`], 10);
      const smValue = parseInt(memo[`position_t${topicId}`], 10);
      return sValue > smValue ? statement : memo;
    }
    return statement;
  }, null);
  return {
    statement: strongestStatement,
    value: parseInt(strongestStatement[`position_t${topicId}`], 10),
  };
};
export const getPositionForValueAndTopic = ({ value, topicId, tables }) => {
  // get position from positions table, contains generic descriptions for each position
  let position =
    tables.positions && tables.positions.data.data.find(p => qe(p.id, value));
  // get position from topic-positions table, optionally containing topic-specific descriptions for each position
  const topicPosition =
    tables['topic-positions'] &&
    tables['topic-positions'].data.data.find(
      tp => qe(tp.position_id, value) && qe(tp.topic_id, topicId),
    );
  // overwrite values
  Object.keys(topicPosition).forEach(key => {
    const val = topicPosition[key];
    if (val && val.trim() !== '') {
      position = {
        ...position,
        [key]: val,
      };
    }
  });
  return position;
};
export const getCountryPositionForTopicAndDate = ({
  countryCode,
  topicId,
  dateString,
  // countries,
  tables,
}) => {
  const date = dateString
    ? new Date(dateString).getTime()
    : new Date().getTime();
  // const country = countries.find(c => c.code === countryCode);
  const countryStatements = getCountryStatements({
    countryCode,
    tables,
    date,
    topicId,
  });
  if (countryStatements && countryStatements.length > 0) {
    const latestCountryPositionStatement = getLatestCountryPositionStatement({
      countryStatements,
      topicId,
    });
    const strongestCountryPositionStatement = getStrongestCountryPositionStatement(
      {
        countryStatements,
        topicId,
      },
    );
    // get position from position table, contains generic descriptions for each position
    const latestPosition = getPositionForValueAndTopic({
      value: latestCountryPositionStatement.value,
      topicId,
      tables,
    });
    // prettier-ignore
    const strongestPosition =
      latestCountryPositionStatement.statement.id === strongestCountryPositionStatement.statement.id
        ? latestPosition
        : getPositionForValueAndTopic({
          value: strongestCountryPositionStatement.value,
          topicId,
          tables,
        });
    return {
      latest: latestCountryPositionStatement,
      strongest: strongestCountryPositionStatement,
      latestPosition,
      strongestPosition,
      value:
        latestCountryPositionStatement.value <
        strongestCountryPositionStatement.value
          ? -1
          : latestCountryPositionStatement.value,
    };
  }
  return {
    value: 0,
  };
};
