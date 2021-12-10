import { sortLabels } from 'utils/string';
import asArray from 'utils/as-array';
import quasiEquals from 'utils/quasi-equals';

import { DEFAULT_LOCALE } from 'i18n';

export const sortPositions = (positions, config) =>
  asArray(positions)
    .slice()
    .sort((a, b) => {
      const aDate = a.source && a.source.date && new Date(a.source.date);
      const bDate = b.source && b.source.date && new Date(b.source.date);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      if (aDate > bDate) return -1;
      return 1;
    })
    .sort((a, b) => {
      // area layer
      if (config.key && config.key.values) {
        const aIndex =
          a.position_id && config.key.values.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.values.indexOf(b.position_id);
        if (aIndex < bIndex) return -1;
        return 1;
      }
      // point layer
      if (config.key && config.key.iconValue && config.key.iconValue.full) {
        const aIndex =
          a.position_id && config.key.iconValue.full.indexOf(a.position_id);
        const bIndex =
          b.position_id && config.key.iconValue.full.indexOf(b.position_id);
        if (aIndex < bIndex) return -1;
        return 1;
      }
      return 1;
    });

export const getStrongestPosition = (positions, config) => {
  if (!positions || positions.length < 1) return null;
  const sorted = sortPositions(positions, config);
  return sorted[0];
};

export const getPositionIcon = (position, config) => {
  if (config.icon && config.icon.datauri) {
    const iconuri = config.icon.datauri.default || config.icon.datauri;
    return iconuri ? iconuri[position.position_id] : null;
  }
  return null;
};

export const getPositionSquareStyle = (positionOrValue, config) => {
  let positionStyle;
  let positionProperty;
  if (config.featureStyle) {
    positionProperty = config.featureStyle.property;
    positionStyle = config.featureStyle.style;
  } else if (config.key && config.key.style) {
    positionProperty = config.key.style.property;
    positionStyle = config.key.style;
  }
  const ps = positionProperty && positionProperty.split('.');
  const positionValue =
    (ps && ps[1] && positionOrValue[ps[1]]) || positionOrValue;
  if (positionStyle) {
    const style = Object.keys(positionStyle).reduce((styleMemo, attr) => {
      if (attr === 'type' || attr === 'property') return styleMemo;
      const attrObject = positionStyle[attr];
      // prettier-ignore
      const attrValue =
        attrObject[positionValue] ||
        attrObject.default ||
        attrObject.none ||
        attrObject.without ||
        attrObject['0'];
      return {
        ...styleMemo,
        [attr]: attrValue,
      };
    }, {});
    return {
      stroke: config.render && config.render.type === 'area',
      weight: config.render && config.render.type === 'area' ? 1 : 0,
      fill: true,
      fillOpacity: config.render && config.render.type === 'area' ? 0.4 : 1,
      ...style,
    };
  }
  return null;
};
export const getPositionCircleStyle = (positionOrValue, config) => {
  const { key, render, icon } = config;
  const isIcon =
    (key && key.icon && !!key.icon.datauri) ||
    (render && render.type === 'marker' && !!icon.datauri);
  const isIconAlt = isIcon && key.style && key.style.type === 'circle';
  if (isIconAlt) {
    const positionStyle = key.style;
    const positionProperty = config.key.style.property;
    const ps = positionProperty && positionProperty.split('.');
    const positionValue =
      (ps && ps[1] && positionOrValue[ps[1]]) || positionOrValue;
    const style = Object.keys(positionStyle).reduce(
      (styleMemo, attr) => {
        if (attr === 'type' || attr === 'property') return styleMemo;
        const attrObject = positionStyle[attr];
        // prettier-ignore
        const attrValue =
          attrObject[positionValue] ||
          attrObject.default ||
          attrObject.none ||
          attrObject.without ||
          attrObject['0'];
        return {
          ...styleMemo,
          [attr]: attrValue,
        };
      },
      {
        weight: '0',
        fillOpacity: 1,
      },
    );
    return {
      style,
    };
  }
  return null;
};

export const getAttributeLabel = (attribute, prefix, locale) => {
  if (
    locale &&
    attribute[`${prefix}_${locale}`] &&
    attribute[`${prefix}_${locale}`].trim() !== ''
  ) {
    return attribute[`${prefix}_${locale}`];
  }
  if (
    attribute[`${prefix}_${DEFAULT_LOCALE}`] &&
    attribute[`${prefix}_${DEFAULT_LOCALE}`].trim() !== ''
  ) {
    return attribute[`${prefix}_${DEFAULT_LOCALE}`];
  }
  return '';
};

export const getPositionLabel = (position, locale) =>
  getAttributeLabel(position, 'position', locale);

export const hexToRgba = (hex, opacity) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  // prettier-ignore
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16,
    )}, ${opacity || 1})`
    : null;
};

export const getPositionStatsFromCountries = (config, countries) => {
  const values =
    (config.info && config.info.values) ||
    (config.key && config.key.iconValue && config.key.iconValue.full);
  if (values && countries) {
    return values.map(val => {
      const positionItems = countries.filter(
        item => item.position && quasiEquals(item.position.position_id, val),
      );
      return {
        val,
        count: positionItems.length,
      };
    });
  }
  return null;
};

const excludeDependentCountries = feature =>
  !feature.properties.code_sovereign ||
  feature.properties.code_sovereign === '';

export const featuresToCountriesWithStrongestPosition = (
  config,
  features,
  locale,
) =>
  features
    .filter(f => excludeDependentCountries(f))
    .filter(f => {
      if (config.info) {
        const ps = config.info.property.split('.');
        const propertyArray = f.properties[ps[0]];
        const otherProps = ps.slice(1);
        return propertyArray.find(prop => {
          const propDeep = otherProps.reduce((memo, p) => memo[p], prop);
          return config.info.values.indexOf(propDeep) > -1;
        });
      }
      return true;
    })
    .map(f => {
      const { positions } = f.properties;
      const position = getStrongestPosition(positions, config);
      return {
        id: f.properties.code || f.properties.f_id,
        label:
          f.properties[`name_${locale}`] ||
          f.properties[`name_${DEFAULT_LOCALE}`],
        position,
      };
    })
    .sort((a, b) => sortLabels(a.label, b.label));

export const getSourceCountFromCountryFeatures = (config, features) => {
  const sources = features
    .filter(f => excludeDependentCountries(f))
    .reduce((memo, f) => {
      if (
        config.properties &&
        config.properties.join &&
        config.properties.join.as &&
        f.properties[config.properties.join.as]
      ) {
        // get country-positions from feature
        const fPositions = f.properties[config.properties.join.as];
        // check each position for the source and remember source in new list m2
        return fPositions.reduce((m2, p) => {
          const { source } = p;
          // if new source, remember source with current country code
          if (source && source.id && m2.indexOf(source.id) === -1) {
            return [...m2, source.id];
          }
          return m2;
        }, memo);
      }
      return memo;
    }, []);
  return sources ? sources.length : null;
};

export const getSourceCountFromPositions = (positionsOverTime, dateString) =>
  Object.keys(positionsOverTime).reduce((count, key) => {
    if (
      dateString &&
      new Date(key).getTime() > new Date(dateString).getTime()
    ) {
      return count;
    }
    if (positionsOverTime[key] && positionsOverTime[key].sources) {
      return count + Object.keys(positionsOverTime[key].sources).length;
    }
    return count;
  }, 0);

export const getSourcesFromCountryFeaturesWithPosition = (
  config,
  features,
  locale,
) => {
  const sources = features
    .filter(f => excludeDependentCountries(f))
    .reduce((memo, f) => {
      const { code } = f.properties;
      if (
        config.properties &&
        config.properties.join &&
        config.properties.join.as &&
        f.properties[config.properties.join.as]
      ) {
        // get country-positions from feature
        const fPositions = f.properties[config.properties.join.as];
        // check each position for the source and remember source in new list m2
        return fPositions.reduce((m2, p) => {
          const { source, position } = p;
          if (source && source.id) {
            // if new source, remember source with current country code
            if (!m2[source.id]) {
              const sx = Object.assign({}, source, {
                position: {
                  position,
                  position_id: position.id,
                },
                countries: [
                  {
                    id: code,
                    label:
                      f.properties[`name_${locale}`] ||
                      f.properties[`name_${DEFAULT_LOCALE}`] ||
                      code,
                  },
                ],
                label:
                  source[`title_${locale}`] ||
                  source[`title_${DEFAULT_LOCALE}`] ||
                  source.id,
              });
              return Object.assign(m2, { [source.id]: sx });
            }
            // if known source, add current feature's country code
            const sx = Object.assign({}, m2[source.id], {
              countries: [
                ...m2[source.id].countries,
                {
                  id: code,
                  label:
                    f.properties[`name_${locale}`] ||
                    f.properties[`name_${DEFAULT_LOCALE}`] ||
                    code,
                },
              ],
            });
            return Object.assign(m2, { [source.id]: sx });
          }
          return m2;
        }, memo);
      }
      return memo;
    }, {});
  return sources;
};

const concatIfMissing = (arr, values) =>
  values.reduce((memo, val) => {
    if (memo.indexOf(val) > -1) {
      return memo;
    }
    return memo.concat([val]);
  }, arr);

const cleanupPositions = positions => {
  if (positions['2']) {
    const pos2 = positions['2'].filter(p2 => positions['1'].indexOf(p2) === -1);
    return Object.assign({}, positions, { '2': pos2 });
  }
  return positions;
};

export const getCountryPositionsOverTimeFromCountryFeatures = (
  config,
  features,
) => {
  const sources = features
    .filter(f => excludeDependentCountries(f))
    .reduce((memo, f) => {
      const { code } = f.properties;
      if (
        config.properties &&
        config.properties.join &&
        config.properties.join.as &&
        f.properties[config.properties.join.as]
      ) {
        // get country-positions from feature
        const fPositions = f.properties[config.properties.join.as];
        // check each position for the source and remember source in new list m2
        return fPositions.reduce((m2, p) => {
          const { source, position } = p;
          if (source && source.id) {
            // if new source, remember source with current country code
            if (!m2[source.id]) {
              const sx = Object.assign({}, source, {
                position,
                countries: [code],
              });
              return Object.assign(m2, { [source.id]: sx });
            }
            // if known source, add current feature's country code
            const sx = Object.assign({}, source, {
              countries: [...m2[source.id].countries, code],
            });
            return Object.assign(m2, { [source.id]: sx });
          }
          return m2;
        }, memo);
      }
      return memo;
    }, {});
  const sourcesSorted = Object.values(sources).sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return aDate > bDate ? 1 : -1;
  });
  // console.log(sourcesSorted)
  const positionsByDate = sourcesSorted.reduce((memo, source) => {
    // console.log(memo, source);
    const previousPositions =
      Object.keys(memo).length > 0
        ? Object.values(memo)[Object.keys(memo).length - 1].positions
        : null;
    let positions;
    if (previousPositions) {
      // prettier-ignore
      positions = Object.assign({}, previousPositions, {
        [source.position_id]: previousPositions[source.position_id]
          ? concatIfMissing(
            previousPositions[source.position_id],
            source.countries,
          )
          : source.countries,
      });
      positions = cleanupPositions(positions);
    } else {
      positions = { [source.position_id]: source.countries };
    }
    if (!memo[source.date]) {
      // remember source
      const date = {
        sources: {
          [source.id]: source,
        },
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
  }, {});
  return positionsByDate;
};

const sanitiseCSVcontent = str => str.replaceAll(`"`, `'`);

// target structure
// const datas = [
//   {
//     cell1: 'row 1 - cell 1',
//     cell2: 'row 1 - cell 2',
//   },
//   {
//     cell1: 'row 2 - cell 1',
//     cell2: 'row 2 - cell 2',
//   },
// ];
//
// source structure
// sources = {
//   ID: {
//     countries: [
//       { country: attributes, ... }
//       ...
//     ],
//     position: {
//       position: { position: atttributes, ... },
//       position_id: id,
//       ...
//     },
//     source: attributes,
//     ...
//   }
//   ...
// }
//
export const getFlatCSVFromSources = (sources, locale) =>
  Object.keys(sources)
    .reduce((memo, sourceId) => {
      const source = sources[sourceId];
      const { position } = source.position;
      // TODO: SANITISE quotes? _ " _ >>> _ ' _ double to single
      // the position attributes
      const positionAttributes = {
        position_id: position.id,
        position: sanitiseCSVcontent(getPositionLabel(position, locale)),
      };
      // the source attributes
      const sourceAttributes = {
        // statement_id: sanitiseCSVcontent(sourceId),
        statement_date: source.date, // format yyy-mm-dd
        statement_name: sanitiseCSVcontent(
          getAttributeLabel(source, 'source', locale),
        ),
        statement_quote: sanitiseCSVcontent(
          getAttributeLabel(source, 'quote', locale),
        ),
        source_title: sanitiseCSVcontent(
          getAttributeLabel(source, 'title', locale),
        ),
        source_url: source.url,
      };
      const sourceCountries = source.countries.map(country => ({
        country_code: country.id,
        country: country.label,
        ...positionAttributes,
        ...sourceAttributes,
      }));
      return memo.concat(sourceCountries);
    }, [])
    .sort((a, b) => (a.country > b.country ? 1 : -1))
    .sort((a, b) => {
      const aDate = a.statement_date && new Date(a.statement_date);
      const bDate = b.statement_date && new Date(b.statement_date);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      if (aDate > bDate) return -1;
      return 1;
    });
