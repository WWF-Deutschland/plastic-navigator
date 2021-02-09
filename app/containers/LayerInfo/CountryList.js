/**
 *
 * CountryList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import styled from 'styled-components';
import { Box } from 'grommet';

import { KeyArea } from 'components/KeyArea';
import { DEFAULT_LOCALE } from 'i18n';
import { POLICY_LAYERS } from 'config';
import { deburr } from 'lodash/string';
import { lowerCase } from 'utils/string';
import quasiEquals from 'utils/quasi-equals';
import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/Map/saga';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import coreMessages from 'messages';

import FeatureList from './FeatureList';
import { getStrongestPosition, getPositionSquareStyle } from './utils';

const AreaWrap = styled(p => <Box {...p} />)`
  position: relative;
`;

export function CountryList({ onLoadLayer, config, layer, intl }) {
  useInjectSaga({ key: 'map', saga });

  useEffect(() => {
    // kick off loading of page content
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      onLoadLayer(config.id, config);
    }
  }, [config]);
  const { locale } = intl;
  if (
    POLICY_LAYERS.indexOf(config.id) === -1 ||
    !layer ||
    !layer.data ||
    !layer.data.features
  ) {
    return null;
  }

  const items = layer.data.features
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
      const square = getPositionSquareStyle(position, config);
      return {
        id: f.properties.f_id,
        label:
          f.properties[`name_${locale}`] ||
          f.properties[`name_${DEFAULT_LOCALE}`],
        position,
        square,
      };
    })
    .sort((a, b) =>
      deburr(lowerCase(a.label)) > deburr(lowerCase(b.label)) ? 1 : -1,
    );
  // TODO icon layer
  let stats;
  if (config.info && config.info.values) {
    stats = config.info.values.map(val => {
      const positionItems = items.filter(item =>
        quasiEquals(item.position.position_id, val),
      );
      let title;
      if (config.key && config.key.title && config.key.title[val]) {
        title =
          config.key.title[val][locale] ||
          config.key.title[val][DEFAULT_LOCALE] ||
          config.key.title[val];
      }
      const position =
        positionItems.length > 0 ? positionItems[0].position : null;
      const square = position && getPositionSquareStyle(position, config);
      return {
        val,
        count: positionItems.length,
        square,
        title,
      };
    });
  }
  // console.log(stats, config)
  return (
    <div>
      <h2>
        <FormattedMessage
          {...coreMessages.countries}
          values={{
            count: items.length,
          }}
        />
      </h2>
      {stats &&
        stats.map(({ val, square, title, count }) => (
          <div key={val}>
            {square && (
              <AreaWrap>
                <KeyArea areaStyles={[square]} />
              </AreaWrap>
            )}
            <span>{`${title || val}: ${count}`}</span>
          </div>
        ))}
      <FeatureList
        title="Select a country for details"
        layerId={config.id}
        items={items}
        collapsable
      />
    </div>
  );
}

CountryList.propTypes = {
  onLoadLayer: PropTypes.func.isRequired,
  config: PropTypes.object,
  layer: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  layer: (state, { config }) => {
    if (POLICY_LAYERS.indexOf(config.id) > -1) {
      return selectLayerByKey(state, config.id);
    }
    return null;
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (id, config) => {
      dispatch(loadLayer(id, config));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryList));
