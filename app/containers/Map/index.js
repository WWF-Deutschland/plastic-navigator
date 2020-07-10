/**
 *
 * Map
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import L from 'leaflet';

import { MAPBOX, PROJECT_CONFIG, MAP_OPTIONS } from 'config';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
// import commonMessages from 'messages';
//
import {
  selectActiveLayers,
  selectConfigByKey,
} from 'containers/App/selectors';

import { setLayerInfo } from 'containers/App/actions';

import Tooltip from './Tooltip';

import { getProjectLayer, getVectorLayer } from './utils';

import reducer from './reducer';
import saga from './saga';
import { selectLayers, selectLayerConfig, selectMapLayers } from './selectors';
import { loadLayer, setMapLayers } from './actions';

const Styled = styled.div`
  background: ${({ theme }) => theme.global.colors.white};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: hidden;
`;
const MapContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;
const TIMEOUT = 3333;

export function Map({
  layerConfig,
  layerIds,
  mapLayers,
  onSetMapLayers,
  onLoadLayer,
  jsonLayers,
  projects,
  onFeatureClick,
}) {
  useInjectReducer({ key: 'map', reducer });
  useInjectSaga({ key: 'map', saga });
  const [tooltip, setTooltip] = useState(null);

  const mapRef = useRef(null);
  const basemapLayerGroupRef = useRef(null);
  const rasterLayerGroupRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);

  const timerTooltip = useRef(false);

  // eslint-disable arrow-body-style
  useEffect(
    () => () => {
      clearTimeout(timerTooltip.current);
    },
    [],
  );
  // eslint-enable arrow-body-style

  // console.log(tooltip)
  const onMarkerOver = (args, config) => {
    setTooltip({
      config,
      anchor: args.containerPoint,
      feature: args.target.feature,
      options: args.target.options,
    });
    clearTimeout(timerTooltip.current);
    timerTooltip.current = setTimeout(() => setTooltip(null), TIMEOUT);
  };
  // const onMarkerOut = (args, config) => {};
  const onMarkerOut = () => null;
  const onMarkerClick = (args, config) => {
    setTooltip({
      config,
      anchor: args.containerPoint,
      feature: args.target.feature,
      options: args.target.options,
    });
    clearTimeout(timerTooltip.current);
    timerTooltip.current = setTimeout(() => setTooltip(null), TIMEOUT);
  };

  const markerEvents = {
    mouseover: onMarkerOver,
    mouseout: onMarkerOut,
    click: onMarkerClick,
  };

  const mapEvents = {
    resize: () => setTooltip(null),
    click: () => {
      setTooltip(null);
    },
    zoomstart: () => setTooltip(null),
    movestart: () => setTooltip(null),
    layeradd: () => setTooltip(null),
    layerremove: () => setTooltip(null),
  };
  // init map
  useEffect(() => {
    mapRef.current = L.map('ll-map', {
      center: MAP_OPTIONS.CENTER,
      zoom: MAP_OPTIONS.ZOOM.INIT,
      minZoom: MAP_OPTIONS.ZOOM.MIN,
      maxZoom: MAP_OPTIONS.ZOOM.MAX,
      maxBounds: [
        [MAP_OPTIONS.BOUNDS.N, MAP_OPTIONS.BOUNDS.W],
        [MAP_OPTIONS.BOUNDS.S, MAP_OPTIONS.BOUNDS.E],
      ],
    }).on(mapEvents);
    mapRef.current.createPane('rasterPane');
    mapRef.current.getPane('rasterPane').style.zIndex = 200;
    mapRef.current.getPane('rasterPane').style.pointerEvents = 'none';
    mapRef.current.createPane('vectorPane');
    mapRef.current.getPane('vectorPane').style.zIndex = 300;
    basemapLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    rasterLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    vectorLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);

  // add basemap
  useEffect(() => {
    if (layerConfig) {
      const basemapConfig =
        layerConfig && layerConfig.find(c => c.id === 'basemap');
      if (basemapConfig.type === 'vector-tiles') {
        basemapLayerGroupRef.current.addLayer(
          L.tileLayer(MAPBOX.STYLE_URL_TEMPLATE, {
            style_id: basemapConfig['style-id'],
            username: MAPBOX.USER,
            accessToken: MAPBOX.TOKEN,
          }),
        );
      }
    }
  }, [layerConfig]);

  // update layers
  useEffect(() => {
    if (layerIds && layerConfig) {
      const newMapLayers = {};
      // remove layers no longer active
      Object.keys(mapLayers).forEach(id => {
        if (layerIds.indexOf(id) < 0) {
          const project =
            projects &&
            projects.find(
              p => p.project_id === id.replace(`${PROJECT_CONFIG.id}-`, ''),
            );
          if (project && mapLayers[id]) {
            const { layer } = mapLayers[id];
            vectorLayerGroupRef.current.removeLayer(layer);
          } else {
            const config = layerConfig.find(c => c.id === id);
            if (config && mapLayers[id]) {
              const { layer } = mapLayers[id];
              if (config.type === 'raster-tiles') {
                rasterLayerGroupRef.current.removeLayer(layer);
              }
              if (config.type === 'geojson') {
                vectorLayerGroupRef.current.removeLayer(layer);
              }
            }
          }
        }
      });
      // add layers not already present
      layerIds.forEach(id => {
        // also check if map does not have layer,
        // otherwise they will not be adeded when hot reloading
        const llayer = mapLayers[id] && mapLayers[id].layer;
        const hasLayer =
          rasterLayerGroupRef.current.hasLayer(llayer) ||
          vectorLayerGroupRef.current.hasLayer(llayer);
        if (Object.keys(mapLayers).indexOf(id) < 0 || !hasLayer) {
          // check if this layer is a project
          const project =
            projects &&
            projects.find(
              p => p.project_id === id.replace(`${PROJECT_CONFIG.id}-`, ''),
            );
          if (project) {
            if (!jsonLayers.projectLocations) {
              onLoadLayer('projectLocations', PROJECT_CONFIG);
            } else {
              const { config } = jsonLayers.projectLocations;
              const layer = getProjectLayer({
                jsonLayer: jsonLayers.projectLocations,
                project,
                markerEvents,
              });
              vectorLayerGroupRef.current.addLayer(layer);
              newMapLayers[id] = { layer, config };
            }
          } else {
            const config = layerConfig.find(c => c.id === id);
            if (config) {
              // raster layer
              if (
                config.type === 'raster-tiles' &&
                config.source === 'mapbox'
              ) {
                if (rasterLayerGroupRef) {
                  const layer = L.tileLayer(MAPBOX.RASTER_URL_TEMPLATE, {
                    id: config.tileset,
                    accessToken: MAPBOX.TOKEN,
                    pane: 'rasterPane',
                  });
                  rasterLayerGroupRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }
              }
              // geojson layer
              if (config.type === 'geojson' && config.source === 'data') {
                // kick of loading of vector data for group if not present
                if (!jsonLayers[id]) {
                  onLoadLayer(id, config);
                }
                if (jsonLayers[id] && vectorLayerGroupRef) {
                  const layer = getVectorLayer({
                    jsonLayer: jsonLayers[id],
                    config,
                    markerEvents,
                  });
                  vectorLayerGroupRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }
              }
            }
          }
        } else {
          newMapLayers[id] = mapLayers[id];
        }
      });
      // remember new layers
      onSetMapLayers(newMapLayers);
    }
  }, [layerIds, layerConfig, jsonLayers, projects]);
  const mapSize = mapRef.current ? mapRef.current.getSize() : [0, 0];
  return (
    <Styled>
      <MapContainer id="ll-map" />
      {tooltip && (
        <Tooltip
          position={tooltip.anchor}
          direction={{
            x: tooltip.anchor.x < mapSize.x / 2 ? 'right' : 'left',
            y: tooltip.anchor.y < (mapSize.y * 3) / 4 ? 'bottom' : 'top',
          }}
          feature={tooltip.feature}
          config={tooltip.config}
          layerOptions={tooltip.options}
          onClose={() => setTooltip(null)}
          onFeatureClick={onFeatureClick}
        />
      )}
    </Styled>
  );
}

Map.propTypes = {
  layerConfig: PropTypes.array,
  projects: PropTypes.array,
  layerIds: PropTypes.array,
  mapLayers: PropTypes.object,
  jsonLayers: PropTypes.object,
  onSetMapLayers: PropTypes.func,
  onLoadLayer: PropTypes.func,
  onFeatureClick: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  layers: state => selectLayers(state),
  layerConfig: state => selectLayerConfig(state),
  layerIds: state => selectActiveLayers(state),
  mapLayers: state => selectMapLayers(state),
  jsonLayers: state => selectLayers(state),
  projects: state => selectConfigByKey(state, { key: 'projects' }),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onSetMapLayers: layers => {
      dispatch(setMapLayers(layers));
    },
    onFeatureClick: ({ feature, layer }) => {
      dispatch(setLayerInfo(layer, feature));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Map);
