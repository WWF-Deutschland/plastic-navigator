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
import { decodeInfoView, findFeature } from 'utils/layers';
import { getAsideInfoWidth } from 'utils/responsive';
import { roundNumber } from 'utils/numbers';
// import { startsWith } from 'utils/string';

// import commonMessages from 'messages';
//
import {
  selectActiveLayers,
  selectConfigByKey,
  selectInfoSearch,
  selectShowKey,
} from 'containers/App/selectors';

import {
  setLayerInfo,
  setMapPosition,
  showLayerInfoModule,
} from 'containers/App/actions';
import PanelKey from 'containers/PanelKey';
import Attribution from 'containers/Attribution';

import LoadingIndicator from 'components/LoadingIndicator';
import MapControls from 'components/MapControls';
import MapControl from 'components/MapControl';
import { Plus, Minus } from 'components/Icons';

import Tooltip from './Tooltip';

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
  selectLayersLoading,
  selectMapPosition,
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

const AttributionWrap = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
`;

const LoadingWrap = styled(MapContainer)`
  z-index: 999;
  pointer-events: none;
  background: none;
`;

const getNWSE = map => {
  const bounds = map.getBounds();
  const nw = bounds.getNorthWest();
  const se = bounds.getSouthEast();
  const n = roundNumber(nw.lat, 5);
  const w = roundNumber(nw.lng, 5);
  const s = roundNumber(se.lat, 5);
  const e = roundNumber(se.lng, 5);
  return `${n}|${w}|${s}|${e}`;
};
const getLLBounds = (nwse, asObject) => {
  const split = nwse.split('|');
  if (split.length === 4) {
    // prettier-ignore
    return asObject
      ? L.latLngBounds(
        L.latLng([split[0], split[1]]),
        L.latLng([split[2], split[3]]),
      )
      : [[split[0], split[1]], [split[2], split[3]]];
  }
  return null;
};

export function Map({
  layersConfig,
  activeLayerIds,
  mapLayers,
  onSetMapLayers,
  onLoadLayer,
  jsonLayers,
  projects,
  onLayerInfo,
  layerInfo,
  size,
  onFeatureHighlight,
  highlightFeature,
  hasKey,
  loading,
  currentModule,
  onMapMove,
  mview,
  layerInfoActive,
}) {
  useInjectReducer({ key: 'map', reducer });
  useInjectSaga({ key: 'map', saga });
  const [tooltip, setTooltip] = useState(null);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [zoom, setZoom] = useState(MAP_OPTIONS.ZOOM.INIT);

  const mapRef = useRef(null);
  const areaHighlightRef = useRef(null);
  const areaTooltipRef = useRef(null);
  const areaInfoRef = useRef(null);
  const areaMaskRef = useRef(null);
  const [infoLayerId, infoFeatureId, infoCopy] = decodeInfoView(layerInfo);
  const [highlightLayerId, highlightFeatureId, highlightCopy] = decodeInfoView(
    highlightFeature,
  );
  const jsonLayerLength = jsonLayers ? Object.keys(jsonLayers).length : 0;

  const showTooltip = (e, config) => {
    // console.log('click', e, config, tooltip);
    L.DomEvent.stopPropagation(e);
    const { target, layer } = e;
    const feature = layer || target.feature;
    const eLayerId = target.options.layerId || config.id;
    const eFeatureId = feature.properties.f_id;
    let anchor = e.containerPoint;
    const mapSize = mapRef.current ? mapRef.current.getSize() : [0, 0];
    const direction = {
      x: anchor.x < mapSize.x / 2 ? 'right' : 'left',
      y: anchor.y < (mapSize.y * 3) / 4 ? 'bottom' : 'top',
    };
    if (!(config.render && config.render.type === 'marker' && config.icon)) {
      anchor = {
        x: direction.x === 'right' ? anchor.x + 10 : anchor.x - 10,
        y: anchor.y,
      };
    }
    setTooltip({
      config,
      anchor,
      direction,
      layerId: eLayerId,
      featureId: eFeatureId,
      feature,
      options: target.options,
    });
    // }
  };

  // console.log(tooltip)
  const onMarkerOver = (e, config) => {
    if (e && config) {
      // console.log('over', e, config, tooltip);
      const feature = e.layer || e.target.feature;
      onFeatureHighlight({
        feature: feature.properties.f_id,
        layer: e.target.options.layerId || config.id,
        copy: e.target.options.copy,
      });
    }
  };
  // const onMarkerOut = (e, config) => {
  // console.log('out', e, config, tooltip);
  const onMarkerOut = () => onFeatureHighlight(null);
  const onMarkerClick = showTooltip;

  const markerEvents = {
    mouseover: onMarkerOver,
    mouseout: onMarkerOut,
    click: onMarkerClick,
  };

  const mapEvents = {
    resize: () => {
      // console.log('resize')
      setTooltip(null);
    },
    click: () => {
      // console.log('mapClick')
      setTooltip(null);
    },
    zoomstart: () => {
      // console.log('zoomstart')
      setTooltip(null);
    },
    zoomend: () => {
      // console.log('zoomstart')
      if (mapRef.current) console.log(mapRef.current.getZoom());
    },
    movestart: () => {
      // console.log('movestart')
      setTooltip(null);
    },
    // layeradd: () => {
    //   // console.log('layerAdd', layer)
    //   // setTooltip(null)
    // },
    // layerremove: () => {
    //   // console.log('layerremove', layer)
    //   // setTooltip(null)
    // },
  };
  // move active marker into view
  useEffect(() => {
    setTooltip(null);
  }, [activeLayerIds]);

  // init map
  useEffect(() => {
    mapRef.current = L.map('ll-map', {
      // center: MAP_OPTIONS.CENTER,
      // zoom: size === 'small' ? MAP_OPTIONS.ZOOM.MIN : MAP_OPTIONS.ZOOM.INIT,
      zoomControl: false,
      minZoom: MAP_OPTIONS.ZOOM.MIN,
      maxZoom: MAP_OPTIONS.ZOOM.MAX,
      maxBounds: [
        [MAP_OPTIONS.BOUNDS.N, MAP_OPTIONS.BOUNDS.W],
        [MAP_OPTIONS.BOUNDS.S, MAP_OPTIONS.BOUNDS.E],
      ],
      attributionControl: false,
    }).on(mapEvents);
    //
    mapRef.current.getPane('tilePane').style.pointerEvents = 'none';
    areaHighlightRef.current = L.layerGroup();
    areaTooltipRef.current = L.layerGroup();
    areaInfoRef.current = L.layerGroup();
    areaMaskRef.current = L.layerGroup();
    areaHighlightRef.current.addTo(mapRef.current);
    areaTooltipRef.current.addTo(mapRef.current);
    areaInfoRef.current.addTo(mapRef.current);
    areaMaskRef.current.addTo(mapRef.current);
    mapRef.current.on('zoomend', () => {
      setZoom(mapRef.current.getZoom());
    });
    mapRef.current.on('moveend', () => {
      onMapMove(getNWSE(mapRef.current));
    });
    mapRef.current.setView(
      MAP_OPTIONS.CENTER,
      size === 'small' ? MAP_OPTIONS.ZOOM.MIN : MAP_OPTIONS.ZOOM.INIT,
    );
  }, []);

  useEffect(() => {
    if (size === 'small') {
      mapRef.current.setZoom(MAP_OPTIONS.ZOOM.MIN);
    }
  }, [size]);
  useEffect(() => {
    if (mapRef.current.getZoom() !== zoom) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    if (mapRef.current) {
      // only fit bounds from mview when we dont have a feature to zoom to
      // - no ids set
      // - if ids set, if layer id is not present in loaded json Layers
      if (
        (mview && mview !== '') ||
        !infoLayerId ||
        !infoFeatureId ||
        (infoLayerId &&
          infoFeatureId &&
          jsonLayers &&
          Object.keys(jsonLayers).length !== 0 &&
          !jsonLayers[infoLayerId])
      ) {
        if (getNWSE(mapRef.current) !== mview) {
          const llbounds = getLLBounds(mview);
          if (llbounds) {
            mapRef.current.fitBounds(llbounds);
          }
        }
      } else if (
        (!mview || mview === '') &&
        layersConfig &&
        infoFeatureId &&
        infoFeatureId !== '' &&
        infoLayerId &&
        jsonLayers &&
        jsonLayers[infoLayerId] &&
        activeLayerIds &&
        activeLayerIds.indexOf(infoLayerId) > -1
      ) {
        const feature = findFeature(
          jsonLayers[infoLayerId].data.features,
          infoFeatureId,
        );

        if (feature && feature.geometry && feature.geometry.coordinates) {
          let featureBounds;
          if (feature.properties && feature.properties.bounds_nwse) {
            featureBounds = getLLBounds(feature.properties.bounds_nwse, true);
          }
          if (!featureBounds || !featureBounds.getCenter) {
            const jsonLayer = L.geoJSON(feature);
            featureBounds = jsonLayer.getBounds();
          }
          mapRef.current.fitBounds(featureBounds, {
            animate: false,
            duration: 0,
            maxZoom: MAP_OPTIONS.ZOOM.MAX - 1,
          });
          // center map on center of feature
          let center = featureBounds.getCenter();
          const aside = getAsideInfoWidth(size);
          // correct center for side panel
          if (layerInfoActive && aside !== 0) {
            const centerPoint = mapRef.current.project(center);
            center = mapRef.current.unproject(
              L.point(centerPoint.x + aside / 2, centerPoint.y),
            );
          }
          mapRef.current.panTo(center, { animate: false, duration: 0 });
        }
      }
    }
  }, [mview, jsonLayerLength]);

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
            }).on({
              loading: () => setTilesLoading(true),
              load: () => setTilesLoading(false),
            }),
          );
        }
      });
    }
  }, [layersConfig]);

  // update layers
  useEffect(() => {
    // console.log('activelayers (according to url) ', activeLayerIds);
    // console.log('mapLayers (currently on map) ', mapLayers);
    // console.log('jsonLayers (loaded into state) ', jsonLayers);
    // console.log('Map: layers config present ', !!layersConfig);
    if (activeLayerIds && layersConfig) {
      const newMapLayers = {};
      // const removeMapLayers = Object.keys(mapLayers).filter(
      //   id => activeLayerIds.map(alId => alId.split('_')[0]).indexOf(id) < 0,
      // );
      // const addMapLayers = activeLayerIds.filter(id => {
      //   const [mapLayerId, indicatorId] = id.split('_');
      //   // also check if map does not have layer,
      //   // otherwise they will not be adeded when hot reloading
      //   const llayer = mapLayers[mapLayerId] && mapLayers[mapLayerId].layer;
      //   const hasLayer = mapRef.current.hasLayer(llayer);
      //   // layer not yet created
      //   return !hasLayer || Object.keys(mapLayers).indexOf(mapLayerId) < 0;
      // });
      // remove layers no longer active
      Object.keys(mapLayers)
        .filter(id => activeLayerIds.indexOf(id) < 0)
        .forEach(id => {
          const project =
            projects &&
            projects.find(
              p => p.project_id === id.replace(`${PROJECT_CONFIG.id}-`, ''),
            );
          if (project && mapLayers[id]) {
            const { layer } = mapLayers[id];
            mapRef.current.removeLayer(layer);
          } else {
            const [configLayerId] = id.split('_');
            const config = layersConfig.find(c => c.id === configLayerId);
            if (config && mapLayers[id]) {
              const { layer } = mapLayers[id];
              if (
                config.type === 'raster-tiles' ||
                config.type === 'geojson' ||
                config.type === 'topojson' ||
                config.type === 'csv'
              ) {
                mapRef.current.removeLayer(layer);
              }
            }
          }
        });
      // add layers not already present
      activeLayerIds.forEach(id => {
        const [configLayerId, indicatorId] = id.split('_');
        // also check if map does not have layer,
        // otherwise they will not be adeded when hot reloading
        const llayer = mapLayers[id] && mapLayers[id].layer;
        const hasLayer = mapRef.current.hasLayer(llayer);
        const config = layersConfig.find(
          c => c.id === id || c.id === configLayerId,
        );
        // layer not yet created
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
              const layer = getProjectLayer({
                jsonLayer: jsonLayers.projectLocations,
                project,
                markerEvents,
              });
              mapRef.current.addLayer(layer);
              newMapLayers[id] = { layer, config: jsonLayers.projectLocations };
            }
          } else if (config) {
            // console.log('config', config, jsonLayers[id])
            // raster layer
            if (config.type === 'raster-tiles' && config.source === 'mapbox') {
              if (mapRef) {
                const layer = L.tileLayer(MAPBOX.RASTER_URL_TEMPLATE, {
                  id: config.tileset,
                  accessToken: MAPBOX.TOKEN,
                  zIndex: config['z-index'] || 1,
                  opacity: (config.style && config.style.opacity) || 1,
                }).on({
                  loading: () => setTilesLoading(true),
                  load: () => setTilesLoading(false),
                });
                mapRef.current.addLayer(layer);
                newMapLayers[id] = { layer, config };
              }
            }
            // csv layer
            // geojson layer
            if (
              config.source === 'data' &&
              (config.type === 'geojson' ||
                config.type === 'topojson' ||
                config.type === 'csv')
            ) {
              // kick of loading of vector data for group if not present
              if (!jsonLayers[configLayerId]) {
                onLoadLayer(configLayerId, config);
              }
              // kick off loading mask layers
              // const maskId = `${id}-mask`;
              // if (config.mask) {
              //   onLoadLayer(maskId, config, { mask: true });
              // }
              // if (jsonLayers[maskId] && areaMaskRef) {
              //   const layer = getVectorLayer({
              //     jsonLayer: jsonLayers[maskId],
              //     config,
              //     state: 'mask',
              //   });
              //   areaMaskRef.current.addLayer(layer);
              //   // newMapLayers[id] = { layer, config };
              // }
              if (jsonLayers[configLayerId] && mapRef) {
                const layer = getVectorLayer({
                  jsonLayer: jsonLayers[configLayerId],
                  config,
                  markerEvents,
                  indicatorId,
                  // also pass date
                });
                mapRef.current.addLayer(layer);
                newMapLayers[id] = { layer, config };
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
  // preload featured layers
  useEffect(() => {
    // console.log('activelayers (according to url) ', activeLayerIds);
    // console.log('mapLayers (currently on map) ', mapLayers);
    // console.log('jsonLayers (loaded into state) ', jsonLayers);
    // console.log('Map: layers config present ', !!layersConfig);
    if (currentModule && currentModule.featuredLayer && layersConfig) {
      if (!jsonLayers[currentModule.featuredLayer]) {
        const config = layersConfig.find(
          c => c.id === currentModule.featuredLayer,
        );
        if (config) {
          onLoadLayer(currentModule.featuredLayer, config);
        }
      }
    }
  }, [currentModule, layersConfig, jsonLayers]);

  // update icon/marker states for mouse over, tooltip and info panel
  useEffect(() => {
    if (mapLayers && layersConfig) {
      Object.keys(mapLayers).forEach(key => {
        const mapLayer = mapLayers[key];
        if (mapLayer) {
          const { config, layer } = mapLayer;
          if (config.render && config.render.type === 'marker' && config.icon) {
            // multiple layers for wrapping dateline
            layer.eachLayer(lcopy => {
              const layerCount = lcopy.getLayers().length;
              lcopy.eachLayer(marker => {
                let icon;
                const fid = marker.feature.properties.f_id;
                const fcode = marker.feature.properties.code;
                const fcodeSov =
                  marker.feature.properties.code_sovereign || null;
                const mcopy = marker.options.copy;
                const infoLayerActive =
                  config['content-default'] === infoLayerId ||
                  config.id === infoLayerId;
                const tooltipOpen =
                  tooltip &&
                  key === tooltip.layerId &&
                  fid === tooltip.featureId &&
                  ((!mcopy && !tooltip.options.copy) ||
                    mcopy === tooltip.options.copy);
                // tooltip or info open
                const active =
                  tooltipOpen ||
                  (infoLayerActive &&
                    (layerCount === 1 ||
                      fcodeSov === infoFeatureId ||
                      fcode === infoFeatureId ||
                      fid === infoFeatureId));
                // mouse over
                const highlight =
                  !active &&
                  key === highlightLayerId &&
                  fid === highlightFeatureId &&
                  ((!mcopy && !highlightCopy) || mcopy === highlightCopy);
                if (active || infoLayerActive || highlight) {
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
                  } else if (infoLayerActive) {
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
    layerInfo, // infoLayerId, infoFeatureId
    layersConfig,
    projects,
    mapLayers,
    size,
    highlightFeature,
    tooltip,
  ]);

  // update feature area when tooltip active (click)
  useEffect(() => {
    if (mapLayers && layersConfig) {
      if (tooltip) {
        Object.keys(mapLayers).forEach(key => {
          const mapLayer = mapLayers[key];
          if (
            mapLayer &&
            mapLayer.config.render &&
            mapLayer.config.render.type === 'area' &&
            jsonLayers[mapLayer.config.id]
          ) {
            const { config } = mapLayer;
            const jsonLayer = jsonLayers[config.id];
            const jsonLayerFiltered = {
              config,
              data: {
                type: jsonLayer.data.type,
                features: jsonLayer.data.features.filter(
                  feature => feature.properties.f_id === tooltip.featureId,
                ),
              },
            };
            const ttLayer = getVectorLayer({
              jsonLayer: jsonLayerFiltered,
              config,
              state: 'active',
            });
            const ll = areaTooltipRef.current.getLayers();
            areaTooltipRef.current.addLayer(ttLayer);
            ll.forEach(l => {
              areaTooltipRef.current.removeLayer(l);
            });
          }
        });
      } else {
        areaTooltipRef.current.clearLayers();
      }
    }
  }, [layersConfig, mapLayers, tooltip]);

  // update feature area when highlighted (mouse over)
  useEffect(() => {
    if (mapLayers && layersConfig) {
      if (highlightFeatureId) {
        Object.keys(mapLayers).forEach(key => {
          const mapLayer = mapLayers[key];
          if (
            mapLayer &&
            mapLayer.config.render &&
            mapLayer.config.render.type === 'area' &&
            mapLayer.config.id === highlightLayerId &&
            jsonLayers[mapLayer.config.id]
          ) {
            const { config } = mapLayer;
            const jsonLayer = jsonLayers[config.id];
            const jsonLayerFiltered = {
              config,
              data: {
                type: jsonLayer.data.type,
                features: jsonLayer.data.features.filter(
                  feature =>
                    feature.properties.f_id === highlightFeatureId &&
                    (!tooltip || tooltip.featureId !== feature.properties.f_id),
                ),
              },
            };
            const highlightLayer = getVectorLayer({
              jsonLayer: jsonLayerFiltered,
              config,
              state: 'hover',
              markerEvents: {
                click: markerEvents.click,
              },
            });
            // shouldn't really be any layers present but just in case
            areaHighlightRef.current.clearLayers();
            areaHighlightRef.current.addLayer(highlightLayer);
          }
        });
      } else {
        areaHighlightRef.current.clearLayers();
      }
    }
  }, [layersConfig, mapLayers, highlightFeature]);

  // update feature area when info active
  useEffect(() => {
    if (mapLayers && layersConfig) {
      if (infoFeatureId) {
        Object.keys(mapLayers).forEach(key => {
          const mapLayer = mapLayers[key];
          if (
            mapLayer &&
            mapLayer.config.render &&
            mapLayer.config.render.type === 'area' &&
            mapLayer.config.id === infoLayerId &&
            jsonLayers[mapLayer.config.id]
          ) {
            const { config } = mapLayer;
            const jsonLayer = jsonLayers[config.id];
            const jsonLayerFiltered = {
              config,
              data: {
                type: jsonLayer.data.type,
                features: jsonLayer.data.features.filter(
                  feature =>
                    (feature.properties.code_sovereign === infoFeatureId ||
                      feature.properties.code === infoFeatureId ||
                      feature.properties.f_id === infoFeatureId) &&
                    (!tooltip || tooltip.featureId !== feature.properties.f_id),
                ),
              },
            };
            const infoLayer = getVectorLayer({
              jsonLayer: jsonLayerFiltered,
              config,
              state: 'info',
              markerEvents: {
                click: markerEvents.click,
              },
            });
            // shouldn't really be any layers present but just in case
            areaInfoRef.current.clearLayers();
            areaInfoRef.current.addLayer(infoLayer);
          }
        });
      } else {
        areaInfoRef.current.clearLayers();
      }
    }
  }, [layersConfig, mapLayers, layerInfo]);

  // move active marker into view
  useEffect(() => {
    if (mapLayers && layersConfig) {
      Object.keys(mapLayers).forEach(key => {
        const mapLayer = mapLayers[key];
        if (mapLayer) {
          const { config, layer } = mapLayer;
          if (config.render && config.render.type === 'marker' && config.icon) {
            // multiple layers for wrapping dateline
            layer.eachLayer(lcopy => {
              const layerCount = lcopy.getLayers().length;
              lcopy.eachLayer(marker => {
                const fid = marker.feature.properties.f_id;
                const mcopy = marker.options.copy;
                const active =
                  key === infoLayerId &&
                  (layerCount === 1 || fid === infoFeatureId) &&
                  ((!mcopy && !infoCopy) || mcopy === infoCopy); // TODO check use of infoCopy
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
  }, [layerInfo, layersConfig, projects, mapLayers, size]);

  return (
    <Styled>
      <MapContainer id="ll-map" />
      {activeLayerIds && activeLayerIds.length > 0 && hasKey && (
        <PanelKey
          activeLayerIds={activeLayerIds.slice().reverse()}
          layersConfig={layersConfig}
          onLayerInfo={args => {
            onLayerInfo(args, layersConfig);
          }}
          jsonLayers={jsonLayers}
          currentModule={currentModule}
        />
      )}
      {tooltip && (
        <Tooltip
          position={tooltip.anchor}
          direction={tooltip.direction}
          feature={tooltip.feature}
          config={tooltip.config}
          layerOptions={tooltip.options}
          onClose={() => setTooltip(null)}
          onFeatureClick={args => {
            setTooltip(null);
            onLayerInfo(args, layersConfig);
          }}
        />
      )}
      <AttributionWrap>
        <Attribution map />
      </AttributionWrap>
      {(tilesLoading || loading) && (
        <LoadingWrap>
          <LoadingIndicator />
        </LoadingWrap>
      )}
      {size !== 'small' && (
        <MapControls
          position="left"
          hasBrand={!window.wwfMpxInsideIframe || !window.wwfMpxInsideWWFIframe}
        >
          <MapControl
            disabled={MAP_OPTIONS.ZOOM.MAX === zoom}
            icon={
              <Plus
                color={MAP_OPTIONS.ZOOM.MAX === zoom ? 'dark-4' : 'black'}
              />
            }
            onClick={() => setZoom(zoom + 1)}
          />
          <MapControl
            disabled={MAP_OPTIONS.ZOOM.MIN === zoom}
            icon={
              <Minus
                color={MAP_OPTIONS.ZOOM.MIN === zoom ? 'dark-4' : 'black'}
              />
            }
            onClick={() => setZoom(zoom - 1)}
          />
        </MapControls>
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
  currentModule: PropTypes.object,
  onSetMapLayers: PropTypes.func,
  onLoadLayer: PropTypes.func,
  onLayerInfo: PropTypes.func,
  onFeatureHighlight: PropTypes.func,
  onMapMove: PropTypes.func,
  highlightFeature: PropTypes.string,
  layerInfo: PropTypes.string,
  mview: PropTypes.string,
  size: PropTypes.string.isRequired,
  hasKey: PropTypes.bool,
  loading: PropTypes.bool,
  layerInfoActive: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  layers: state => selectLayers(state),
  layersConfig: state => selectLayerConfig(state),
  activeLayerIds: state => selectActiveLayers(state),
  mapLayers: state => selectMapLayers(state),
  jsonLayers: state => selectLayers(state),
  projects: state => selectConfigByKey(state, { key: 'projects' }),
  layerInfo: state => selectInfoSearch(state),
  highlightFeature: state => selectHighlightFeature(state),
  loading: state => selectLayersLoading(state),
  mview: state => selectMapPosition(state),
  hasKey: state => selectShowKey(state),
});

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onLoadLayer: (key, config, args) => {
      dispatch(loadLayer(key, config, args));
    },
    onSetMapLayers: layers => {
      dispatch(setMapLayers(layers));
    },
    onLayerInfo: ({ layer, feature, copy }, layersConfig) => {
      dispatch(setLayerInfo(layer, feature, copy));
      const { currentModule } = ownProps;
      const config = layersConfig && layersConfig.find(l => l.id === layer);
      const isModuleLayer =
        config &&
        currentModule &&
        currentModule.featuredLayer &&
        (currentModule.featuredLayer === config['content-default'] ||
          currentModule.featuredLayer === layer);
      if (!isModuleLayer) {
        dispatch(showLayerInfoModule());
      }
    },
    onFeatureHighlight: args => {
      const layer = args ? args.layer : null;
      const feature = args ? args.feature : null;
      const copy = args ? args.copy : null;
      dispatch(setHighlightFeature(layer, feature, copy));
    },
    onMapMove: position => {
      dispatch(setMapPosition(position));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Map);
