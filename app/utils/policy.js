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
    countryStatementIds.map(id =>
      tables.sources.data.data.find(s => qe(id, s.id)),
    );
  if (dateString) {
    countryStatements = countryStatements.filter(
      s => new Date(s.date) <= new Date(dateString),
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

export const getCountriesWithStrongestPosition = ({
  indicatorId,
  layerInfo,
  locale,
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
      countryCode: country.code,
      topicId: indicatorId,
      tables: layerInfo.data.tables,
      includeOpposing,
      dateString,
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

const getAggregateScore = ({ parent, children, tables }) => {
  const countChildren = children.length;
  const countPositions = children.reduce(
    (memo, child) => {
      const { value } = child.position;
      return {
        ...memo,
        [value]: (memo[value] || 0) + 1,
      };
    },
    {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    },
  );
  let value = 0;
  // all value of 3 => agg value 3
  if (countPositions[3] === countChildren) {
    value = 3;
    // all have value 2 or 3 => agg value 2
  } else if (countPositions[3] + countPositions[2] === countChildren) {
    value = 2;
    // some have value 2 or 3 ==> agg value 1
  } else if (countPositions[3] > 0 || countPositions[2] > 0) {
    value = 1;
  }
  // else 0
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
    .filter(t => !isAggregate(t))
    .map(t => ({
      ...t,
      position: getCountryPositionForTopicAndDate({
        countryCode: country.code,
        topicId: t.id,
        tables,
      }),
    }));
  const aggIndicatorScores = topics
    .filter(t => isAggregate(t))
    .map(t => {
      const childIds = t.aggregate.split(',');
      const childIndicators = indicatorScores.filter(
        child => childIds.indexOf(child.id) > -1,
      );
      return {
        ...t,
        position: getAggregateScore({
          parent: t,
          children: childIndicators,
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

const concatIfMissing = (arr, values) =>
  values.reduce((memo, val) => {
    if (memo.indexOf(val) > -1) {
      return memo;
    }
    return memo.concat([val]);
  }, arr);

const cleanupPositions = positions => {
  const cleaned = Object.keys(positions)
    // lowest first
    .sort((a, b) => (parseInt(a, 10) > parseInt(b, 10) ? 1 : -1))
    .reduce((memoPositions, posValue) => {
      const posCountryCodes = positions[posValue];
      const val = parseInt(posValue, 10);
      const higherPosCountryCodes = Object.keys(positions).reduce(
        (memo, otherPosValue) => {
          if (parseInt(otherPosValue, 10) > val) {
            return [...memo, ...positions[otherPosValue]];
          }
          return memo;
        },
        [],
      );
      const cleanedCodes = posCountryCodes.filter(
        code => higherPosCountryCodes.indexOf(code) < 0,
      );
      return Object.assign({}, memoPositions, { [posValue]: cleanedCodes });
    }, {});
  return cleaned;
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
  includeWithout = false,
  includeOpposing = false,
}) => {
  // console.log('getCountryPositionsOverTimeFromCountryFeatures: indicatorId, layerInfo', indicatorId, layerInfo, typeof indicatorId)
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
    const positionValues = tables.positions.data.data.reduce(
      (memoPosValues, p) => {
        const value = parseInt(p.id, 10);
        if (value === 0 && !includeWithout) {
          return memoPosValues;
        }
        if (value < 0 && !includeOpposing) {
          return memoPosValues;
        }
        return [...memoPosValues, value];
      },
      [],
    );
    // console.log('getCountryPositionsOverTimeFromCountryFeatures', positionValues, indicatorId)
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
    // console.log('statementsWithCountryCodes', statementsWithCountryCodes)

    const positionsByDate = statementsWithCountryCodes.reduce(
      (memo, source) => {
        // console.log(memo, source);
        const previousPositions =
          Object.keys(memo).length > 0
            ? Object.values(memo)[Object.keys(memo).length - 1].positions
            : null;
        let positions;
        if (previousPositions) {
          // prettier-ignore
          positions = Object.assign({}, previousPositions, {
            [source.position.id]: previousPositions[source.position.id]
              ? concatIfMissing(
                previousPositions[source.position.id],
                source.countryCodes,
              )
              : source.countryCodes,
          });
          positions = cleanupPositions(positions);
        } else {
          positions = { [source.position.id]: source.countryCodes };
        }
        if (!memo[source.date]) {
          // remember source
          const date = {
            sources: { [source.id]: source },
            positions,
          };
          return Object.assign({}, memo, { [source.date]: date });
        }
        if (memo[source.date]) {
          const dateSources = Object.assign({}, memo[source.date].sources, {
            [source.id]: source,
          });
          const date = Object.assign({}, memo[source.date], {
            sources: dateSources,
            positions,
          });
          return Object.assign({}, memo, { [source.date]: date });
        }
        return memo;
      },
      {},
    );
    return positionsByDate;
  }
  return [];
};

export const isAggregate = topic =>
  !!topic && topic.aggregate && topic.aggregate.trim() !== '';
export const isArchived = topic =>
  !!topic && topic.archived && topic.archived.trim() === '1';

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
  indicator,
  layerInfo,
}) => {
  const childIds = indicator.aggregate && indicator.aggregate.split(',');
  // console.log('childIds.length', childIds.length)
  // let positionsOverTime
  const childPositions = childIds.reduce((memo, id) => {
    const positionsOverTime =
      layerInfo &&
      layerInfo.data &&
      getCountryPositionsOverTimeFromCountryFeatures({
        indicatorId: id,
        layerInfo,
        includeOpposing: false,
        includeWithout: false,
        includeHidden: false,
      });
    // console.log('id, positionsOverTime', id, positionsOverTime)
    // order all positions for all topics by date
    return Object.keys(positionsOverTime).reduce((m2, date) => {
      if (m2[date]) {
        return {
          ...m2,
          [date]: {
            ...m2[date],
            [id]: positionsOverTime[date],
          },
        };
      }
      return {
        ...m2,
        [date]: {
          [id]: positionsOverTime[date],
        },
      };
    }, memo);
    // return {
    //   ...memo,
    //   [id]: positionsOverTime,
    // };
  }, {});
  // console.log('childPositions', childPositions)
  // for every date, check every country and all its positions
  // re-organise by country
  // also need for
  const dates = Object.keys(childPositions).sort((a, b) => {
    const aDate = new Date(a).getTime();
    const bDate = new Date(b).getTime();
    return aDate > bDate ? 1 : -1;
  });

  // figure out child positions by date and country
  const positionsByDateAndCountry = dates.reduce((memo, date, index) => {
    const positions = childPositions[date];
    const positionsPreviousByCountry = index > 0 ? memo[dates[index - 1]] : {};
    // from this:
    // {
    //   [topicid]: {
    //     positions: {
    //       [supportlevel]: [ ...countrycodes ]
    //     }
    //   }
    // }
    // to this:
    // {
    //   [countrycode]: {
    //     [topicid1]: [supportlevel1]
    //     [topicid2]: [supportlevel2]
    //     [topicid3]: [supportlevel3]
    //     [topicid4]: [supportlevel4]
    //   }
    // }
    const byCountry = Object.keys(positions).reduce((memo2, topicId) => {
      const countryPositions = positions[topicId].positions;
      const byLevelOfSupport = Object.keys(countryPositions).reduce(
        (memo3, levelOfSupport) => {
          const countriesForTopicAndLevel = countryPositions[levelOfSupport];
          const byCountryAndTopic = countriesForTopicAndLevel.reduce(
            (memo4, countryCode) => {
              if (memo4[countryCode]) {
                // this should not be needed as each country should have one position on a topic only
                return {
                  ...memo4,
                  [countryCode]: {
                    ...memo4[countryCode],
                    [topicId]: levelOfSupport,
                  },
                };
              }
              return {
                ...memo4,
                [countryCode]: {
                  [topicId]: levelOfSupport,
                },
              };
            },
            memo3,
          );
          return byCountryAndTopic;
        },
        memo2,
      );
      return byLevelOfSupport;
    }, positionsPreviousByCountry);
    return {
      ...memo,
      [date]: byCountry,
    };
  }, {});
  // console.log('positionsByDateAndCountry', positionsByDateAndCountry)

  // now aggregate for each date and country
  return Object.keys(positionsByDateAndCountry).reduce((memo, date) => {
    const positionsForDate = positionsByDateAndCountry[date];
    const positionValuesForDate = Object.keys(positionsForDate).reduce(
      (memo2, countryCode) => {
        const countryPositions = positionsForDate[countryCode];
        const countPositions = Object.values(countryPositions).reduce(
          (memo3, levelOfSupport) => ({
            ...memo3,
            [levelOfSupport]: (memo3[levelOfSupport] || 0) + 1,
          }),
          { 0: 0, 1: 0, 2: 0, 3: 0 },
        );
        let value = 0;
        // all value of 3 => agg value 3
        if (countPositions[3] === childIds.length) {
          value = 3;
          // all have value 2 or 3 => agg value 2
        } else if (countPositions[3] + countPositions[2] === childIds.length) {
          value = 2;
          // some have value 2 or 3 ==> agg value 1
        } else if (countPositions[3] > 0 || countPositions[2] > 0) {
          value = 1;
        }
        return {
          ...memo2,
          [value]: [...memo2[value], countryCode],
        };
      },
      { 1: [], 2: [], 3: [] },
    );
    // console.log('positionValuesForDate', positionValuesForDate)
    return {
      ...memo,
      [date]: {
        positions: positionValuesForDate,
      },
    };
  }, {});
};
