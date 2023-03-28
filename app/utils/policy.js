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

const mergePositions = ({ topicPosition, position }) => {
  let merged = position;
  Object.keys(topicPosition).forEach(key => {
    const val = topicPosition[key];
    if (val && val.trim() !== '') {
      merged = {
        ...merged,
        [key]: val,
      };
    }
  });
  return merged;
};
export const getPositionForValueAndTopic = ({ value, topicId, tables }) => {
  // get position from positions table, contains generic descriptions for each position
  const position =
    tables.positions && tables.positions.data.data.find(p => qe(p.id, value));
  // get position from topic-positions table, optionally containing topic-specific descriptions for each position
  const topicPosition =
    tables['topic-positions'] &&
    tables['topic-positions'].data.data.find(
      tp => qe(tp.position_id, value) && qe(tp.topic_id, topicId),
    );
  return mergePositions({ topicPosition, position });
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

export const getCountryPositionStatsForTopicAndDate = ({
  indicatorId,
  layerData,
  dateString,
}) => {
  const topicPositions =
    layerData.tables &&
    layerData.tables['topic-positions'] &&
    layerData.tables['topic-positions'].data.data.filter(tp =>
      qe(tp.topic_id, indicatorId),
    );
  const positions = topicPositions.map(tp => {
    const pos = layerData.tables.positions
      ? layerData.tables.positions.data.data.find(p => qe(p.id, tp.position_id))
      : null;
    return pos ? mergePositions({ topicPosition: tp, position: pos }) : tp;
  });
  const countryPositions =
    layerData.features &&
    layerData.features.map(country => ({
      code: country.code,
      position: getCountryPositionForTopicAndDate({
        countryCode: country.code,
        topicId: indicatorId,
        dateString,
        tables: layerData.tables,
      }),
    }));
  return (
    positions &&
    Object.values(countryPositions).reduce((statsMemo, countryPosition) => {
      const value = countryPosition.position.value || 0;
      return statsMemo.map(stat => {
        if (qe(stat.id, value)) {
          return { ...stat, count: stat.count ? stat.count + 1 : 1 };
        }
        return { ...stat, count: stat.count || 0 };
      });
    }, positions)
  );
};

export const getTopicsFromData = layerData => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    return [...layerData.data.tables.topics.data.data].sort((a, b) => {
      if (a.archived === '1' && b.archived !== '1') {
        return 1;
      }
      if (a.archived !== '1' && b.archived === '1') {
        return -1;
      }
      return a.id > b.id ? 1 : -1;
    });
  }
  return null;
};
export const getTopicFromData = ({ indicatorId, layerData }) => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    return layerData.data.tables.topics.data.data[indicatorId];
  }
  return null;
};
export const getPreviousTopicFromData = ({ indicatorId, layerData }) => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    const validTopicIds = layerData.data.tables.topics.data.data
      .filter(t => t.archived !== '1')
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const prevIndex =
      currentIndex === 0 ? validTopicIds.length - 1 : currentIndex - 1;
    return layerData.data.tables.topics.data.data[validTopicIds[prevIndex]];
  }
  return null;
};
export const getNextTopicFromData = ({ indicatorId, layerData }) => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    const validTopicIds = layerData.data.tables.topics.data.data
      .filter(t => t.archived !== '1')
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const nextIndex =
      currentIndex === validTopicIds.length - 1 ? 0 : currentIndex + 1;
    return layerData.data.tables.topics.data.data[validTopicIds[nextIndex]];
  }
  return null;
};
