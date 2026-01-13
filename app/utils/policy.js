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
  layerInfo,
  statementId,
  locale,
}) => {
  const { tables, features } = layerInfo.data;
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
      if (isHidden(topic)) return memoPositions;
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
  dateString,
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
    countryStatementIds.reduce((memo, id) => {
      const statement = tables.sources.data.data.find(s => qe(id, s.id));
      return statement ? [...memo, statement] : memo;
    }, []);
  if (dateString) {
    countryStatements = countryStatements.filter(
      s => new Date(s.date) <= new Date(dateString),
    );
  }
  if (topicId) {
    countryStatements = countryStatements.filter(
      s =>
        typeof s[`position_t${topicId}`] !== 'undefined' &&
        `${s[`position_t${topicId}`]}` &&
        `${s[`position_t${topicId}`]}`.trim() !== '',
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

const getLatestCountryPositionStatement = ({ countryStatements, topicId }) => {
  const latestStatement = countryStatements[0];
  return {
    statement: latestStatement,
    value: parseInt(latestStatement[`position_t${topicId}`], 10),
  };
};
const getStrongestCountryPositionStatement = ({
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

const getAggregateValueFromCounts = (countPositions, noOfTopics) => {
  let value = 0;
  // all value of 3 => agg value 3
  if (countPositions[3] + countPositions[2] === noOfTopics) {
    value = 3;
    // some have value 2 or 3 ==> agg value 1
  } else if (countPositions[3] > 0 || countPositions[2] > 0) {
    value = 1;
  }
  return value;
};

const countPositionValues = countryPositionValues =>
  Object.values(countryPositionValues).reduce(
    (memo3, levelOfSupport) => ({
      ...memo3,
      [levelOfSupport]: (memo3[levelOfSupport] || 0) + 1,
    }),
    { 0: 0, 1: 0, 2: 0, 3: 0 },
  );

export const getCountryPositionForAnyTopicAndDate = ({
  countryCode,
  topic,
  dateString,
  // countries,
  tables,
  locale,
}) => {
  if (!isAggregate(topic)) {
    return getCountryPositionForTopicAndDateDeprecated({
      countryCode,
      topicId: topic.id,
      dateString,
      tables,
      locale,
    });
  }
  // is Aggregate
  const childIds = topic.aggregate.split(',');
  const childPositions = childIds.reduce((memo, id) => {
    const positionForTopic = getCountryPositionForTopicAndDateDeprecated({
      countryCode,
      topicId: id,
      dateString,
      tables,
      locale,
    });
    return {
      ...memo,
      [id]: positionForTopic,
    };
  }, {});
  const countPositions =
    childPositions &&
    countPositionValues(Object.values(childPositions).map(p => p.value));
  const value = getAggregateValueFromCounts(countPositions, childIds.length);
  const position = getPositionForValueAndTopic({
    value,
    topicId: topic.id,
    tables,
  });
  // else 0
  return {
    value,
    topic: topic[`title_${locale}`],
    latestPosition: position,
  };
};
export const getAggregateValueForStatement = (statement, childTopicIds) => {
  const countPositions =
    childTopicIds &&
    countPositionValues(
      childTopicIds.map(topicId => {
        let levelOfSupport = statement[`position_t${topicId}`];
        if (levelOfSupport === '') {
          levelOfSupport = 0;
        }
        return levelOfSupport;
      }),
    );
  return getAggregateValueFromCounts(countPositions, childTopicIds.length);
};

export const getCountryPositionForTopicAndDateDeprecated = ({
  countryCode,
  topicId,
  dateString,
  // countries,
  tables,
  locale,
}) => {
  // const country = countries.find(c => c.code === countryCode);
  const countryStatements = getCountryStatements({
    countryCode,
    tables,
    dateString,
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
    // const isConflict =
    //   latestCountryPositionStatement.value <
    //   strongestCountryPositionStatement.value;
    // if (isConflict) {
    //   console.log(
    //     'isConflict, latestCountryPositionStatement.value, strongestCountryPositionStatement.value',
    //     isConflict,
    //     countryCode,
    //     latestCountryPositionStatement.value,
    //     strongestCountryPositionStatement.value,
    //     latestCountryPositionStatement,
    //     strongestCountryPositionStatement,
    //   );
    // }
    return {
      latest: latestCountryPositionStatement,
      strongest: strongestCountryPositionStatement,
      latestPosition,
      strongestPosition,
      conflicting:
        latestCountryPositionStatement.value <
        strongestCountryPositionStatement.value,
      value: latestCountryPositionStatement.value,
      topic: getTopicTitle({ indicatorId: topicId, tables, locale }),
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
    topic: getTopicTitle({ indicatorId: topicId, tables, locale }),
  };
};
export const getCountryPositionForTopicAndDate = ({
  positionsOverTime,
  countryCode,
  topicId,
  dateString,
  // countries,
  tables,
  locale,
}) => {
  if (!positionsOverTime || Object.keys(positionsOverTime).length === 0) {
    return null;
  }
  const dates = Object.keys(positionsOverTime).sort();
  const targetDate = dateString || dates[dates.length - 1]; // Most recent if no date given
  // If specific date requested but doesn't exist, find most recent before it
  let dateToUse = targetDate;
  if (dateString && !positionsOverTime[dateString]) {
    const requestedTime = new Date(dateString).getTime();
    const validDates = dates.filter(
      d => new Date(d).getTime() <= requestedTime,
    );
    if (validDates.length === 0) return null; // No data before requested date
    dateToUse = validDates[validDates.length - 1];
  }
  const positions =
    positionsOverTime[dateToUse] && positionsOverTime[dateToUse].positions;
  if (!positions) return null;

  // Find which position this country is in
  // for (const [positionId, countryCodes] of Object.entries(positions)) {
  //   if (countryCodes.includes(countryCode)) {
  //     return parseInt(positionId, 10);
  //   }
  // }
  // const country = countries.find(c => c.code === countryCode);
  // const countryStatements = getCountryStatements({
  //   countryCode,
  //   tables,
  //   dateString,
  //   topicId,
  // });
  // if (countryStatements && countryStatements.length > 0) {
  const countryPositionEntry = Object.entries(positions).find(
    ([, countryCodes]) => countryCodes.includes(countryCode),
  );
  const countryPositionValue = countryPositionEntry
    ? parseInt(countryPositionEntry[0], 10)
    : 0;
  // get position from position table, contains generic descriptions for each position
  const datePosition = getPositionForValueAndTopic({
    value: countryPositionValue,
    topicId,
    tables,
  });
  return {
    datePosition,
    value: countryPositionValue,
    topic: getTopicTitle({ indicatorId: topicId, tables, locale }),
  };
};

export const getTopicsFromData = layerInfo => {
  if (
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.tables &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.topics.data.data
  ) {
    return [...layerInfo.data.tables.topics.data.data].sort((a, b) => {
      if (a.archived === '1' && b.archived !== '1') {
        return 1;
      }
      if (a.archived !== '1' && b.archived === '1') {
        return -1;
      }
      if (isAggregate(a)) {
        return -1;
      }
      if (isAggregate(b)) {
        return 1;
      }
      return parseInt(a.id, 10) > parseInt(b.id, 10) ? 1 : -1;
    });
  }
  return null;
};
export const getTopicFromData = ({ indicatorId, layerInfo }) => {
  if (
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.tables &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.topics.data.data
  ) {
    return layerInfo.data.tables.topics.data.data.find(d =>
      qe(d.id, indicatorId),
    );
  }
  return null;
};
export const getPreviousTopicFromData = ({
  indicatorId,
  layerInfo,
  archived,
}) => {
  if (
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.tables &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.topics.data.data
  ) {
    const validTopicIds = layerInfo.data.tables.topics.data.data
      .filter(t => (archived ? t.archived === '1' : t.archived !== '1'))
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const prevIndex =
      currentIndex === 0 ? validTopicIds.length - 1 : currentIndex - 1;
    return layerInfo.data.tables.topics.data.data.find(d =>
      qe(d.id, validTopicIds[prevIndex]),
    );
  }
  return null;
};
export const getNextTopicFromData = ({ indicatorId, layerInfo, archived }) => {
  if (
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.tables &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.topics.data.data
  ) {
    const validTopicIds = layerInfo.data.tables.topics.data.data
      .filter(t => (archived ? t.archived === '1' : t.archived !== '1'))
      .map(t => parseInt(t.id, 10));
    const currentIndex = validTopicIds.indexOf(parseInt(indicatorId, 10));
    const nextIndex =
      currentIndex === validTopicIds.length - 1 ? 0 : currentIndex + 1;
    return layerInfo.data.tables.topics.data.data.find(d =>
      qe(d.id, validTopicIds[nextIndex]),
    );
  }
  return null;
};

export const getCountriesWithPosition = ({
  indicatorId,
  layerInfo,
  locale,
  positionsOverTime,
  dateString,
  includeOpposing = true,
  includeWithout = false,
  includeHidden = false,
}) =>
  layerInfo.data &&
  layerInfo.data.features &&
  layerInfo.data.features.reduce((listMemo, country) => {
    if (!includeHidden && !excludeHiddenCountries(country)) {
      return listMemo;
    }
    const position = getCountryPositionForTopicAndDate({
      positionsOverTime,
      countryCode: country.code,
      topicId: indicatorId,
      tables: layerInfo.data.tables,
      includeOpposing,
      dateString,
    });
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
        code: country.code,
        label:
          (locale && country[`name_${locale}`]) ||
          country[`name_${DEFAULT_LOCALE}`],
        position,
      },
    ];
  }, []);

export const getStatementsForTopic = ({ indicatorId, layerInfo, locale }) =>
  layerInfo &&
  layerInfo.data &&
  layerInfo.data.tables &&
  layerInfo.data.tables.sources &&
  layerInfo.data.tables.sources.data.data.reduce((listMemo, statement) => {
    if (
      typeof statement[`position_t${indicatorId}`] !== 'undefined' &&
      statement[`position_t${indicatorId}`] !== null &&
      statement[`position_t${indicatorId}`] !== ''
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

const getAggregateScore = ({ parent, childTopics, tables }) => {
  const countPositions =
    childTopics &&
    countPositionValues(
      Object.values(childTopics).map(topic => topic.position.value),
    );
  const value =
    countPositions &&
    getAggregateValueFromCounts(countPositions, childTopics.length);
  const position = getPositionForValueAndTopic({
    value,
    topicId: parent.id,
    tables,
  });
  return {
    value,
    latestPosition: position,
  };
};

export const getIndicatorScoresForCountry = ({ country, layerInfo }) => {
  const topics = getTopicsFromData(layerInfo);
  const tables = layerInfo && layerInfo.data && layerInfo.data.tables;
  const indicatorScores = topics
    .filter(t => !isAggregate(t) && !isHidden(t))
    .map(t => ({
      ...t,
      position: getCountryPositionForTopicAndDateDeprecated({
        countryCode: country.code,
        topicId: t.id,
        tables,
      }),
    }));
  const aggIndicatorScores = topics
    .filter(t => isAggregate(t) && !isHidden(t))
    .map(t => {
      const childIds = t.aggregate.split(',');
      const childTopics = indicatorScores.filter(
        child => childIds.indexOf(child.id) > -1,
      );
      return {
        ...t,
        position: getAggregateScore({
          parent: t,
          childTopics,
          tables,
        }),
      };
    });
  return [...aggIndicatorScores, ...indicatorScores];
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

export const getTopicTitle = ({ layerInfo, indicatorId, locale, tables }) => {
  const xtables =
    tables || (layerInfo && layerInfo.data && layerInfo.data.tables);
  if (
    typeof indicatorId !== 'undefined' &&
    xtables &&
    xtables.topics &&
    xtables.topics.data
  ) {
    const topic = xtables.topics.data.data.find(t => qe(t.id, indicatorId));

    if (topic) {
      return (
        topic[`short_${locale}`] ||
        topic[`title_${locale}`] ||
        topic[`short_${DEFAULT_LOCALE}`] ||
        topic[`title_${DEFAULT_LOCALE}`]
      );
    }
  }

  return 'Topic not found';
};
export const getTopicMapAnnotation = ({ layerInfo, indicatorId, locale }) => {
  if (
    typeof indicatorId !== 'undefined' &&
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.tables &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.topics.data
  ) {
    const topic = layerInfo.data.tables.topics.data.data.find(t =>
      qe(t.id, indicatorId),
    );
    if (topic) {
      return (
        topic[`annotation_${locale}`] || topic[`annotation_${DEFAULT_LOCALE}`]
      );
    }
  }

  return null;
};

export const getPositionForTopicAndValue = ({
  tables,
  positionValue,
  indicatorId,
}) => {
  const position = tables.positions.data.data.find(p =>
    qe(p.id, positionValue),
  );
  // get position from topic-positions table, optionally containing topic-specific descriptions for each position
  const topicPosition = tables['topic-positions'].data.data.find(
    tp => qe(tp.position_id, positionValue) && qe(tp.topic_id, indicatorId),
  );
  return topicPosition ? mergePositions({ topicPosition, position }) : position;
};

export const getCountryPositionsOverTimeFromCountryFeatures = ({
  layerInfo,
  indicatorId,
  includeHidden = false,
  // includeWithout = false,
  // includeOpposing = false,
}) => {
  console.log(
    'getCountryPositionsOverTimeFromCountryFeatures: indicatorId, layerInfo',
    indicatorId,
    layerInfo,
    typeof indicatorId,
  );
  if (
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.features && // countries
    layerInfo.data.tables &&
    layerInfo.data.tables.sources &&
    layerInfo.data.tables.topics &&
    layerInfo.data.tables.positions &&
    layerInfo.data.tables['topic-positions'] &&
    layerInfo.data.tables['country-sources']
  ) {
    const { tables, features } = layerInfo.data;

    // Helper: Check if statement is from a group for a specific country
    const isGroupStatement = (statementId, countryCode) => {
      const cs = tables['country-sources'].data.data.find(
        csx =>
          csx.source_id === statementId && csx.country_code === countryCode,
      );
      return cs && cs.via_group_id && `${cs.via_group_id}`.trim() !== '';
    };

    // Helper: Get event_id for a statement
    const getEventId = statementId => {
      const source = tables.sources.data.data.find(s => qe(s.id, statementId));
      return source && source.event_id && `${source.event_id}`.trim() !== ''
        ? source.event_id
        : null;
    };

    // Helper: Check if individual statement exists for same event (same date or earlier)
    const hasEarlierIndividualForEvent = (eventId, countryCode, currentDate) =>
      tables['country-sources'].data.data.some(cs => {
        if (cs.country_code !== countryCode) {
          return false;
        }
        if (cs.via_group_id || cs.via_group_code) {
          return false; // Must be individual
        }

        const statement = tables.sources.data.data.find(s =>
          qe(s.id, cs.source_id),
        );
        if (!statement || statement.event_id !== eventId) {
          return false;
        }

        const positionRawValue = statement[`position_t${indicatorId}`];
        if (!positionRawValue || `${positionRawValue}`.trim() === '') {
          return false;
        }

        const statementDate = new Date(statement.date).getTime();
        const checkDate = new Date(currentDate).getTime();
        return statementDate <= checkDate;
      });

    const topicPositions = layerInfo.data.tables[
      'topic-positions'
    ].data.data.filter(tp => qe(tp.topic_id, indicatorId));

    const positionValues = tables.positions.data.data.reduce(
      (memoPosValues, p) => {
        const value = parseInt(p.id, 10);
        if (!topicPositions.find(tp => qe(tp.position_id, value))) {
          return memoPosValues;
        }
        return [...memoPosValues, value];
      },
      [],
    );

    const statementsWithCountryCodes = tables.sources.data.data
      .reduce((statementsMemo, statement) => {
        // check relevance for current topic
        const positionValue = parseInt(
          statement[`position_t${indicatorId}`],
          10,
        );
        // console.log(statement.id, positionValue)
        if (positionValues.indexOf(positionValue) < 0) {
          return statementsMemo;
        }
        const countryCodes = tables['country-sources'].data.data.reduce(
          (memoCountries, cs) => {
            if (cs.source_id !== statement.id) {
              return memoCountries;
            }
            const country = features.find(c => c.code === cs.country_code);
            if (!country) return memoCountries;
            if (!excludeHiddenCountries(country) && !includeHidden) {
              return memoCountries;
            }
            return [...memoCountries, cs.country_code];
          },
          [],
        );
        const positionClean = getPositionForTopicAndValue({
          tables,
          indicatorId,
          positionValue,
        });
        return [
          ...statementsMemo,
          Object.assign({}, statement, {
            countryCodes,
            position: positionClean,
          }),
        ];
      }, [])
      .sort((a, b) => {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        return aDate > bDate ? 1 : -1;
      });

    // First pass: Group statements by date
    const statementsByDate = statementsWithCountryCodes.reduce(
      (memo, source) => {
        const existing = memo[source.date] || [];
        return {
          ...memo,
          [source.date]: [...existing, source],
        };
      },
      {},
    );
    // console.log('positionsByDate start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    const positionsByDate = Object.keys(statementsByDate)
      .sort() // Ensure chronological order
      .reduce((memo, date) => {
        const statementsForDate = statementsByDate[date];
        // const uniqueCountryCodes = [...new Set(source.countryCodes)];
        // console.log(memo, source);
        const previousPositions =
          Object.keys(memo).length > 0
            ? Object.values(memo)[Object.keys(memo).length - 1].positions
            : null;

        const positions = { ...previousPositions };
        const sources = {};

        // Track highest position per country for THIS date
        const countryPositions = {}; // { countryCode: positionValue }
        statementsForDate.forEach(source => {
          const uniqueCountryCodes = [...new Set(source.countryCodes)];
          const sourcePositionValue = parseInt(source.position.id, 10);
          const eventId = getEventId(source.id);

          // Store source
          sources[source.id] = source;

          // Process each country in this statement
          uniqueCountryCodes.forEach(code => {
            const isGroup = isGroupStatement(source.id, code);
            // Ignore group statement if earlier individual statement exist
            // if (code === 'CUB') {
            //   console.log('date------------------', date)
            //   console.log('source', source.code, source.title_en)
            //   console.log('source date', source.date)
            //   console.log('isGroup', isGroup)
            //   console.log('eventId', eventId)
            //   console.log('hasEarlierIndividualForEvent', hasEarlierIndividualForEvent(eventId, code, date))
            // }
            if (
              isGroup &&
              eventId &&
              hasEarlierIndividualForEvent(eventId, code, date)
            ) {
              return; // Skip this country for this statement
            }
            // Track highest position for each country
            if (
              !countryPositions[code] ||
              sourcePositionValue > countryPositions[code]
            ) {
              countryPositions[code] = sourcePositionValue;
            }
          });
        });
        // Now apply the positions
        Object.entries(countryPositions).forEach(([code, posValue]) => {
          // Remove country from all positions
          Object.keys(positions).forEach(posId => {
            positions[posId] = positions[posId].filter(c => c !== code);
          });

          // Add to new position
          const posId = String(posValue);
          if (!positions[posId]) {
            positions[posId] = [];
          }
          if (!positions[posId].includes(code)) {
            positions[posId].push(code);
          }
        });

        // Clean up empty arrays
        // Object.keys(positions).forEach(posId => {
        //   if (positions[posId].length === 0) {
        //     delete positions[posId];
        //   }
        // });
        // Filter out unwanted positions at the end
        // const filteredPositions = Object.keys(positions).reduce(
        //   (filtered, posId) => {
        //     const posValue = parseInt(posId, 10);
        //     // Skip position 0 if !includeWithout
        //     if (posValue === 0 && !includeWithout) {
        //       return filtered;
        //     }
        //     // Skip negative positions if !includeOpposing
        //     if (posValue < 0 && !includeOpposing) {
        //       return filtered;
        //     }
        //     return { ...filtered, [posId]: positions[posId] };
        //   },
        //   {},
        // );
        return { ...memo, [date]: { sources, positions } };
      }, {});
    return positionsByDate;
  }
  return [];
};

export const isAggregate = topic =>
  !!topic && topic.aggregate && topic.aggregate.trim() !== '';
export const isArchived = topic =>
  checkAttribute(topic, 'archived', ['1', 'true', 'TRUE']) && !isHidden(topic);
export const isHidden = topic =>
  checkAttribute(topic, 'hidden', ['1', 'true', 'TRUE']);

const checkAttribute = (item, attribute, values = ['1'], inverse) =>
  inverse
    ? !!item && item[attribute] && values.indexOf(item[attribute]) === -1
    : !!item && item[attribute] && values.indexOf(item[attribute]) > -1;

export const getChildTopics = (parentTopic, topics, locale) => {
  const childIds = parentTopic.aggregate && parentTopic.aggregate.split(',');
  return topics
    .filter(child => childIds.indexOf(child.id) > -1)
    .map(child => ({
      ...child,
      label: child[`short_${locale}`] || child[`short_${DEFAULT_LOCALE}`],
    }));
};

export const getCountryAggregatePositionsOverTime = ({
  // indicator,
  // layerInfo,
}) => {
  return null;
}
//   const childIds = indicator.aggregate && indicator.aggregate.split(',');
//   // console.log('childIds.length', childIds.length)
//   // let positionsOverTime
//   const childPositions = childIds.reduce((memo, id) => {
//     const positionsOverTime =
//       layerInfo &&
//       layerInfo.data &&
//       getCountryPositionsOverTimeFromCountryFeatures({
//         indicatorId: id,
//         layerInfo,
//         includeOpposing: false,
//         includeWithout: false,
//         includeHidden: false,
//       });
//     // console.log('id, positionsOverTime', id, positionsOverTime)
//     // order all positions for all topics by date
//     return Object.keys(positionsOverTime).reduce((m2, date) => {
//       if (m2[date]) {
//         return {
//           ...m2,
//           [date]: {
//             ...m2[date],
//             [id]: positionsOverTime[date],
//           },
//         };
//       }
//       return {
//         ...m2,
//         [date]: {
//           [id]: positionsOverTime[date],
//         },
//       };
//     }, memo);
//     // return {
//     //   ...memo,
//     //   [id]: positionsOverTime,
//     // };
//   }, {});
//   // for every date, check every country and all its positions
//   // re-organise by country
//   // also need for
//   const dates = Object.keys(childPositions).sort((a, b) => {
//     const aDate = new Date(a).getTime();
//     const bDate = new Date(b).getTime();
//     return aDate > bDate ? 1 : -1;
//   });
//
//   // figure out child positions by date and country
//   const positionsByDateAndCountry = dates.reduce((memo, date, index) => {
//     const positions = childPositions[date];
//
//     const sourcesForDate = Object.keys(positions).reduce(
//       (sourceMemo, topicId) => {
//         const sourcesForDateAndTopic = positions[topicId].sources;
//         const sources = Object.keys(sourcesForDateAndTopic).reduce(
//           (sourceMemo2, sourceId) =>
//             sourceMemo2[sourceId]
//               ? sourceMemo2
//               : { ...sourceMemo, [sourceId]: sourcesForDateAndTopic[sourceId] },
//           sourceMemo,
//         );
//         return sources;
//       },
//       {},
//     );
//     // console.log('memo', memo)
//     const positionsPreviousByCountry =
//       index > 0 ? memo[dates[index - 1]].countries : {};
//     // from this:
//     // {
//     //   [topicid]: {
//     //     positions: {
//     //       [supportlevel]: [ ...countrycodes ]
//     //     },
//     //     sources: {
//     //       [sourceid]: { ...source details }
//     //     }
//     //   }
//     // }
//     // to this:
//     // {
//     //   [countrycode]: {
//     //     [topicid1]: [supportlevel1]
//     //     [topicid2]: [supportlevel2]
//     //     [topicid3]: [supportlevel3]
//     //     [topicid4]: [supportlevel4]
//     //   }
//     // }
//     const byCountry = Object.keys(positions).reduce((memo2, topicId) => {
//       // console.log('positions[topicId]', positions[topicId])
//       const countryPositions = positions[topicId].positions;
//       // console.log('positions', positions)
//       const byLevelOfSupport = Object.keys(countryPositions).reduce(
//         (memo3, levelOfSupport) => {
//           const countriesForTopicAndLevel = countryPositions[levelOfSupport];
//           const byCountryAndTopic = countriesForTopicAndLevel.reduce(
//             (memo4, countryCode) => {
//               if (memo4[countryCode]) {
//                 // this should not be needed as each country should have one position on a topic only
//                 return {
//                   ...memo4,
//                   [countryCode]: {
//                     ...memo4[countryCode],
//                     [topicId]: levelOfSupport,
//                   },
//                 };
//               }
//               return {
//                 ...memo4,
//                 [countryCode]: {
//                   [topicId]: levelOfSupport,
//                 },
//               };
//             },
//             memo3,
//           );
//           return byCountryAndTopic;
//         },
//         memo2,
//       );
//       // console.log('byLevelOfSupport', byLevelOfSupport)
//       return byLevelOfSupport;
//     }, positionsPreviousByCountry);
//     return {
//       ...memo,
//       [date]: {
//         countries: byCountry,
//         sources: sourcesForDate,
//       },
//     };
//   }, {});
//   // console.log('positionsByDateAndCountry', positionsByDateAndCountry)
//
//   // now aggregate for each date and country
//   let aggPositionValues = { 0: [], 1: [], 2: [], 3: [], 4: [] };
//   // make sure we only use positions that are defined for topic ( excluding 0)
//   const topicPositions =
//     layerInfo &&
//     layerInfo.data &&
//     layerInfo.data.tables &&
//     layerInfo.data.tables['topic-positions'] &&
//     layerInfo.data.tables['topic-positions'].data &&
//     layerInfo.data.tables['topic-positions'].data.data.filter(row =>
//       qe(row.topic_id, indicator.id),
//     );
//   if (topicPositions) {
//     aggPositionValues = topicPositions.reduce((memo, tp) => {
//       if (parseInt(tp.position_id, 10) > 0) {
//         return {
//           ...memo,
//           [tp.position_id]: [],
//         };
//       }
//       return memo;
//     }, {});
//   }
//   return Object.keys(positionsByDateAndCountry).reduce((memo, date) => {
//     const positionsForDate = positionsByDateAndCountry[date].countries;
//     // console.log('positionsForDate', positionsForDate);
//     const positionValuesForDate = Object.keys(positionsForDate).reduce(
//       (memo2, countryCode) => {
//         const countryPositions = positionsForDate[countryCode];
//         const countPositions = countPositionValues(countryPositions);
//         const value = getAggregateValueFromCounts(
//           countPositions,
//           childIds.length,
//         );
//         return {
//           ...memo2,
//           [value]: [...memo2[value], countryCode],
//         };
//       },
//       aggPositionValues,
//     );
//     return {
//       ...memo,
//       [date]: {
//         positions: positionValuesForDate,
//         sources: positionsByDateAndCountry[date].sources,
//       },
//     };
//   }, {});
// };
//
// export const getCountriesWithStrongestPositionAggregated = ({
//   indicator,
//   layerInfo,
//   locale,
// }) => {
//   const childIds =
//     indicator && indicator.aggregate && indicator.aggregate.split(',');
//   const childPositions = childIds.reduce((memo, id) => {
//     const countries = getCountriesWithPosition({
//       indicatorId: id,
//       layerInfo,
//       locale,
//     });
//
//     return {
//       ...memo,
//       [id]: countries,
//     };
//   }, {});
//   // from this:
//   // {
//   // [topicid]: [
//   //   {
//   //     code: [code],
//   //     other: [countryAttributes],
//   //     positions: {
//   //       value: [value],
//   //     }
//   //   }
//   // ]
//   // to this:
//   // {
//   //   [countrycode]: {
//   //     code: [code],
//   //     other: [countryAttributes],
//   //     positions: {
//   //       [topicid1]: [supportlevel1]
//   //       [topicid2]: [supportlevel2]
//   //       [topicid3]: [supportlevel3]
//   //       [topicid4]: [supportlevel4]
//   //     },
//   // }
//   const positionsLatest = Object.keys(childPositions).reduce(
//     (memo, indicatorId) => {
//       // data for one topic and all countries
//       const countryIndicatorData = childPositions[indicatorId];
//       return countryIndicatorData.reduce((memo2, countryData) => {
//         // countryData : data for one topic and 1 country
//         if (memo[countryData.code]) {
//           return {
//             ...memo2,
//             [countryData.code]: {
//               ...memo[countryData.code],
//               positions: {
//                 ...memo[countryData.code].positions,
//                 [indicatorId]: countryData.position,
//               },
//             },
//           };
//         }
//         return {
//           ...memo2,
//           [countryData.code]: {
//             ...countryData,
//             positions: {
//               [indicatorId]: countryData.position,
//             },
//           },
//         };
//       }, memo);
//     },
//     {},
//   );
//   // now aggregate for each country
//   const countryPositionValues = Object.keys(positionsLatest).reduce(
//     (memo, countryCode) => {
//       // countryData
//       const countryData = positionsLatest[countryCode];
//       const countPositions = countPositionValues(
//         Object.values(countryData.positions).map(p => p.value),
//       );
//       const value = getAggregateValueFromCounts(
//         countPositions,
//         childIds.length,
//       );
//       return [
//         ...memo,
//         {
//           ...countryData,
//           position: { value },
//         },
//       ];
//     },
//     [],
//   );
//   return countryPositionValues;
// };
