import qe from 'utils/quasi-equals';
import { DEFAULT_LOCALE } from 'i18n';
import {
  startsWith,
  lowerCase,
  regExMultipleWords,
  cleanupSearchTarget,
} from './string';
const excludeHiddenCountries = country => country.display !== 'inactive';

export const getPositionForStatement = ({ topicId, statement, tables }) => {
  const value =
    statement[`position_t${topicId}`] &&
    parseInt(statement[`position_t${topicId}`], 10);
  return getPositionForValueAndTopic({ value, topicId, tables });
};

export const getStatementWithPositionsAndCountries = ({
  layerData,
  statementId,
  locale,
}) => {
  const { tables, features } = layerData.data;
  console.log(tables)
  const statement = tables.sources.data.data.find(s => qe(s.id, statementId));
  const statementCountries = tables['country-sources'].data.data
    .filter(cs => qe(cs.source_id, statementId))
    .map(cs => {
      const country = features.find(f => qe(f.code, cs.country_code));
      return {
        id: country.code,
        label: country[`name_${locale}`] || country[`name_${DEFAULT_LOCALE}`],
      };
    });
  return {
    ...statement,
    positions: tables.topics.data.data.reduce((memoPositions, topic) => {
      const p = getPositionForStatement({
        topicId: topic.id,
        statement,
        tables,
      });
      if (p) return [...memoPositions, { ...p, topic }];
      return memoPositions;
    }, []),
    countries: statementCountries,
  };
};

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
  return countryStatements.sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    // chaeck value when dates are equal
    if (a.date === b.date) {
      const aValue = parseInt(a[`position_t${topicId}`], 10);
      const bValue = parseInt(b[`position_t${topicId}`], 10);
      return aValue < bValue ? 1 : -1; // higher values first
    }
    return aDate < bDate ? 1 : -1;
  });
};

export const getLatestCountryPositionStatement = ({
  countryStatements,
  topicId,
}) => {
  const latestStatement = countryStatements[0];
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
  if (merged && topicPosition) {
    Object.keys(topicPosition).forEach(key => {
      const val = topicPosition[key];
      if (val && val.trim() !== '') {
        merged = {
          ...merged,
          [key]: val,
        };
      }
    });
    return { ...merged, value: parseInt(merged.id, 10) };
  }
  return null;
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
  const date = dateString && new Date(dateString).getTime();

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
      conflicting:
        latestCountryPositionStatement.value <
        strongestCountryPositionStatement.value,
      value: latestCountryPositionStatement.value,
    };
  }
  const positionWithoutStatement = getPositionForValueAndTopic({
    value: 0,
    topicId,
    tables,
  });
  return {
    latestPosition: positionWithoutStatement,
    strongestPosition: positionWithoutStatement,
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
export const getPreviousTopicFromData = ({
  indicatorId,
  layerData,
  archived,
}) => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    const validTopicIds = layerData.data.tables.topics.data.data
      .filter(t => (archived ? t.archived === '1' : t.archived !== '1'))
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const prevIndex =
      currentIndex === 0 ? validTopicIds.length - 1 : currentIndex - 1;
    return layerData.data.tables.topics.data.data[validTopicIds[prevIndex]];
  }
  return null;
};
export const getNextTopicFromData = ({ indicatorId, layerData, archived }) => {
  if (
    layerData &&
    layerData.data &&
    layerData.data.tables &&
    layerData.data.tables.topics &&
    layerData.data.tables.topics.data.data
  ) {
    const validTopicIds = layerData.data.tables.topics.data.data
      .filter(t => (archived ? t.archived === '1' : t.archived !== '1'))
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const nextIndex =
      currentIndex === validTopicIds.length - 1 ? 0 : currentIndex + 1;
    return layerData.data.tables.topics.data.data[validTopicIds[nextIndex]];
  }
  return null;
};

export const getCountriesWithStrongestPosition = ({
  indicatorId,
  layerData,
  locale,
  includeOpposing = true,
  includeWithout = false,
  includeHidden = false,
}) =>
  layerData.data &&
  layerData.data.features &&
  layerData.data.features.reduce((listMemo, country) => {
    if (!includeHidden && !excludeHiddenCountries(country)) {
      return listMemo;
    }
    const position = getCountryPositionForTopicAndDate({
      countryCode: country.code,
      topicId: indicatorId,
      tables: layerData.data.tables,
      includeOpposing,
    });
    // console.log('country', country.code)
    // console.log('position', position.value)
    if (!includeWithout && position && position.value === 0) {
      return listMemo;
    }
    if (!includeOpposing && position && position.value < 0) {
      return listMemo;
    }
    return [
      ...listMemo,
      {
        id: country.code,
        label: country[`name_${locale}`] || country[`name_${DEFAULT_LOCALE}`],
        position,
      },
    ];
  }, []);

export const getStatementsForTopic = ({ indicatorId, layerData, locale }) =>
  layerData &&
  layerData.data &&
  layerData.data.tables &&
  layerData.data.tables.sources &&
  layerData.data.tables.sources.data.data.reduce((listMemo, statement) => {
    if (
      statement[`position_t${indicatorId}`] !== '' &&
      !qe(statement[`position_t${indicatorId}`], 0)
    ) {
      return [
        ...listMemo,
        {
          id: statement.id,
          label:
            statement[`title_${locale}`] ||
            statement[`title_${DEFAULT_LOCALE}`],
          date: statement.date,
          position: {
            value: parseInt(statement[`position_t${indicatorId}`], 10),
          },
        },
      ];
    }
    return listMemo;
  }, []);

export const getIndicatorScoresForCountry = ({ country, layerData }) => {
  const topics = getTopicsFromData(layerData);
  return topics.map(t => ({
    ...t,
    position: getCountryPositionForTopicAndDate({
      countryCode: country.code,
      topicId: t.id,
      tables: layerData.data.tables,
    }),
  }));
};

export const filterCountries = (item, test) => {
  if (!test || test.length < 2) return true;
  try {
    // try code
    if (item.code && startsWith(lowerCase(item.code), lowerCase(test))) {
      return true;
    }
    // try id
    if (item.id && startsWith(lowerCase(item.id), lowerCase(test))) {
      return true;
    }
    // try full label as multiple words
    const regex = new RegExp(regExMultipleWords(test), 'i');
    return regex.test(cleanupSearchTarget(item.label));
  } catch (e) {
    return true;
  }
};
export const filterSources = (item, test) => {
  if (!test || test.length < 2) return true;
  try {
    // try id
    if (item.id && startsWith(lowerCase(item.id), lowerCase(test))) {
      return true;
    }
    const regex = new RegExp(regExMultipleWords(test), 'i');
    return regex.test(cleanupSearchTarget(item.label));
  } catch (e) {
    return true;
  }
};
