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
import { getLayerFeatureIds } from 'utils/layers';
import { getAsideInfoWidth } from 'utils/responsive';
// import commonMessages from 'messages';
//
import {
  selectActiveLayers,
  selectConfigByKey,
  selectInfoSearch,
} from 'containers/App/selectors';

import { setLayerInfo } from 'containers/App/actions';

import Tooltip from './Tooltip';
import KeyPanel from './KeyPanel';

import {
  getProjectLayer,
  getVectorLayer,
  getIcon,
  getMapPaddedBounds,
} from './utils';

import reducer from './reducer';
import saga from './saga';
import {
  selectLayers,
  selectLayerConfig,
  selectMapLayers,
  selectHighlightFeature,
} from './selectors';
import { loadLayer, setMapLayers, setHighlightFeature } from './actions';

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
  background: ${({ theme }) => theme.global.colors.map};
`;

export function Map({
  layersConfig,
  activeLayerIds,
  mapLayers,
  onSetMapLayers,
  onLoadLayer,
  jsonLayers,
  projects,
  onFeatureClick,
  info,
  size,
  onFeatureHighlight,
  highlightFeature,
  hasKey,
}) {
  useInjectReducer({ key: 'map', reducer });
  useInjectSaga({ key: 'map', saga });
  const [tooltip, setTooltip] = useState(null);

  const mapRef = useRef(null);
  const [layerId, featureId, copy] = getLayerFeatureIds(info);
  const [
    layerHighlightId,
    featureHighlightId,
    copyHighlight,
  ] = getLayerFeatureIds(highlightFeature);

  const showMarker = (e, config) => {
    L.DomEvent.stopPropagation(e);
    const { target } = e;
    const eLayerId = target.options.layerId || config.id;
    const eFeatureId = target.feature.properties.f_id;
    // if (
    //   tooltip &&
    //   tooltip.layerId === eLayerId &&
    //   tooltip.featureId === eFeatureId
    // ) {
    //   setTooltip(null);
    // } else {
    setTooltip({
      config,
      anchor: e.containerPoint,
      layerId: eLayerId,
      featureId: eFeatureId,
      feature: target.feature,
      options: target.options,
    });
    // }
  };

  // console.log(tooltip)
  const onMarkerOver = (e, config) => {
    if (e && config) {
      // console.log(e.target)
      onFeatureHighlight({
        feature: e.target.feature.properties.f_id,
        layer: e.target.options.layerId || config.id,
        copy: e.target.options.copy,
      });
    }
  };
  const onMarkerOut = () => onFeatureHighlight(null);
  const onMarkerClick = showMarker;

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
    mapRef.current.getPane('tilePane').style.pointerEvents = 'none';
  }, []);

  // add basemap
  useEffect(() => {
    if (layersConfig) {
      const basemapConfigs =
        layersConfig && layersConfig.filter(c => c.id === 'basemap');
      basemapConfigs.forEach(config => {
        if (config.type === 'vector-tiles') {
          mapRef.current.addLayer(
            L.tileLayer(MAPBOX.STYLE_URL_TEMPLATE, {
              style_id: config['style-id'],
              username: MAPBOX.USER,
              accessToken: MAPBOX.TOKEN,
              zIndex: config['z-index'] || 1,
            }),
          );
        }
      });
    }
  }, [layersConfig]);

  // update layers
  useEffect(() => {
    if (activeLayerIds && layersConfig) {
      const newMapLayers = {};
      // remove layers no longer active
      Object.keys(mapLayers).forEach(id => {
        if (activeLayerIds.indexOf(id) < 0) {
          const project =
            projects &&
            projects.find(
              p => p.project_id === id.replace(`${PROJECT_CONFIG.id}-`, ''),
            );
          if (project && mapLayers[id]) {
            const { layer } = mapLayers[id];
            mapRef.current.removeLayer(layer);
          } else {
            const config = layersConfig.find(c => c.id === id);
            if (config && mapLayers[id]) {
              const { layer } = mapLayers[id];
              if (config.type === 'raster-tiles') {
                mapRef.current.removeLayer(layer);
              }
              if (config.type === 'geojson') {
                mapRef.current.removeLayer(layer);
              }
            }
          }
        }
      });
      // add layers not already present
      activeLayerIds.forEach(id => {
        // also check if map does not have layer,
        // otherwise they will not be adeded when hot reloading
        const llayer = mapLayers[id] && mapLayers[id].layer;
        const hasLayer =
          mapRef.current.hasLayer(llayer) || mapRef.current.hasLayer(llayer);
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
              mapRef.current.addLayer(layer);
              newMapLayers[id] = { layer, config };
            }
          } else {
            const config = layersConfig.find(c => c.id === id);
            if (config) {
              // raster layer
              if (
                config.type === 'raster-tiles' &&
                config.source === 'mapbox'
              ) {
                if (mapRef) {
                  const layer = L.tileLayer(MAPBOX.RASTER_URL_TEMPLATE, {
                    id: config.tileset,
                    accessToken: MAPBOX.TOKEN,
                    zIndex: config['z-index'] || 1,
                  });
                  mapRef.current.addLayer(layer);
                  newMapLayers[id] = { layer, config };
                }
              }
              // geojson layer
              if (config.type === 'geojson' && config.source === 'data') {
                // kick of loading of vector data for group if not present
                if (!jsonLayers[id]) {
                  onLoadLayer(id, config);
                }
                if (jsonLayers[id] && mapRef) {
                  const layer = getVectorLayer({
                    jsonLayer: jsonLayers[id],
                    config,
                    markerEvents,
                  });
                  mapRef.current.addLayer(layer);
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
  }, [activeLayerIds, layersConfig, jsonLayers, projects]);

  // update icon states
  useEffect(() => {
    if (mapLayers && layersConfig) {
      Object.keys(mapLayers).forEach(key => {
        const mapLayer = mapLayers[key];
        if (mapLayer) {
          const { config, layer } = mapLayer;
          // console.log(config, layer, featureId)
          if (config.icon) {
            // multiple layers for wrapping dateline
            layer.eachLayer(lcopy => {
              const layerCount = lcopy.getLayers().length;
              lcopy.eachLayer(marker => {
                let icon;
                const fid = marker.feature.properties.f_id;
                const mcopy = marker.options.copy;
                const layerActive = key === layerId;
                const tooltipOpen =
                  tooltip &&
                  key === tooltip.layerId &&
                  fid === tooltip.featureId &&
                  ((!mcopy && !tooltip.options.copy) ||
                    mcopy === tooltip.options.copy);
                const active =
                  tooltipOpen ||
                  (layerActive && (layerCount === 1 || fid === featureId));
                const highlight =
                  !active &&
                  key === layerHighlightId &&
                  fid === featureHighlightId &&
                  ((!mcopy && !copyHighlight) || mcopy === copyHighlight);
                if (active || layerActive || highlight) {
                  if (highlight) {
                    icon = getIcon(config.icon, {
                      feature: marker.feature,
                      latlng: marker.getLatLng(),
                      state: 'hover',
                    });
                  } else if (active) {
                    icon = getIcon(config.icon, {
                      feature: marker.feature,
                      latlng: marker.getLatLng(),
                      state: 'active',
                    });
                  } else if (layerActive) {
                    icon = getIcon(config.icon, {
                      feature: marker.feature,
                      latlng: marker.getLatLng(),
                      state: 'semi-active',
                    });
                  }
                  // if (active) marker.setZIndexOffset(1000);
                } else {
                  marker.setZIndexOffset(0);
                  icon = getIcon(config.icon, {
                    feature: marker.feature,
                    latlng: marker.getLatLng(),
                    state: 'default',
                  });
                }
                marker.setIcon(icon);
              });
            });
          }
        }
      });
    }
  }, [
    info,
    layersConfig,
    projects,
    mapLayers,
    size,
    featureHighlightId,
    tooltip,
  ]);

  // move active marker into view
  useEffect(() => {
    if (mapLayers && layersConfig) {
      Object.keys(mapLayers).forEach(key => {
        const mapLayer = mapLayers[key];
        if (mapLayer) {
          const { config, layer } = mapLayer;
          // console.log(config, layer, featureId)
          if (config.icon) {
            // multiple layers for wrapping dateline
            layer.eachLayer(lcopy => {
              const layerCount = lcopy.getLayers().length;
              lcopy.eachLayer(marker => {
                const fid = marker.feature.properties.f_id;
                const mcopy = marker.options.copy;
                const active =
                  key === layerId &&
                  (layerCount === 1 || fid === featureId) &&
                  ((!mcopy && !copy) || mcopy === copy);
                if (active) {
                  const latlng = marker.getLatLng();
                  const aside = getAsideInfoWidth(size);
                  const bounds = getMapPaddedBounds(mapRef.current, {
                    n: 50,
                    e: Math.max(50, aside + 50),
                    s: 50,
                    w: 50,
                  });
                  if (!bounds.contains(latlng)) {
                    const point = mapRef.current.project(latlng);
                    const latLngAside = mapRef.current.unproject(
                      L.point(point.x + aside / 2, point.y),
                    );
                    mapRef.current.panTo(latLngAside);
                  }
                }
              });
            });
          }
        }
      });
    }
  }, [info, layersConfig, projects, mapLayers, size]);

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
      {activeLayerIds && activeLayerIds.length > 0 && hasKey && (
        <KeyPanel
          activeLayerIds={activeLayerIds.slice().reverse()}
          layersConfig={layersConfig}
          projects={projects}
          onLayerInfo={onFeatureClick}
        />
      )}
    </Styled>
  );
}

Map.propTypes = {
  layersConfig: PropTypes.array,
  projects: PropTypes.array,
  activeLayerIds: PropTypes.array,
  mapLayers: PropTypes.object,
  jsonLayers: PropTypes.object,
  onSetMapLayers: PropTypes.func,
  onLoadLayer: PropTypes.func,
  onFeatureClick: PropTypes.func,
  onFeatureHighlight: PropTypes.func,
  highlightFeature: PropTypes.string,
  info: PropTypes.string,
  size: PropTypes.string.isRequired,
  hasKey: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  layers: state => selectLayers(state),
  layersConfig: state => selectLayerConfig(state),
  activeLayerIds: state => selectActiveLayers(state),
  mapLayers: state => selectMapLayers(state),
  jsonLayers: state => selectLayers(state),
  projects: state => selectConfigByKey(state, { key: 'projects' }),
  info: state => selectInfoSearch(state),
  highlightFeature: state => selectHighlightFeature(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onSetMapLayers: layers => {
      dispatch(setMapLayers(layers));
    },
    onFeatureClick: ({ feature, layer, copy }) => {
      dispatch(setLayerInfo(layer, feature, copy));
    },
    onFeatureHighlight: args => {
      const layer = args ? args.layer : null;
      const feature = args ? args.feature : null;
      const copy = args ? args.copy : null;
      dispatch(setHighlightFeature(layer, feature, copy));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Map);
