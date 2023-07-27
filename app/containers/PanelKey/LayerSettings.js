import React from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_LOCALE } from 'i18n';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Text, Box } from 'grommet';

import { InfoSolid as Info } from 'components/Icons';

import qe from 'utils/quasi-equals';
import { startsWith } from 'utils/string';

import Checkbox from 'components/Checkbox';
import ToggleOnOff from 'components/ToggleOnOff';
import MarkdownText from 'components/MarkdownText';

import LayerButtonInfo from './LayerButtonInfo';

import messages from './messages';
import { getLayerTitle } from './utils';

const LayerTitleWrap = styled(p => (
  <Box
    direction="row"
    align="center"
    margin={{ vertical: 'xsmall' }}
    responsive={false}
    {...p}
  />
))`
  min-height: 22px;
`;

const Settings = styled(p => (
  <Box gap="xsmall" margin={{ top: 'small' }} responsive={false} {...p} />
))``;
const GeoSettings = styled(p => (
  <Box gap="xsmall" responsive={false} {...p} />
))``;
const Setting = styled(p => <Box responsive={false} {...p} />)`
  margin-left: ${({ secondary }) => (secondary ? 20 : 0)}px;
`;

const LayerTitle = styled(p => <Text size="xsmall" {...p} />)`
  font-weight: 700;
`;

export function LayerSettings({
  config,
  layerGeometries,
  onSetLayerGeometries,
  intl,
  onLayerInfo,
}) {
  const { locale } = intl;

  const geometries =
    config.geometries && config.geometries.filter(geo => geo.settings);
  // figure out any settings for current layer
  const layerSettings = layerGeometries.reduce((memo, lg) => {
    const [layerId, rest] = lg.split('_');
    if (config.id === layerId) {
      return [...memo, rest];
    }
    return memo;
  }, []);
  // console.log('config', config)

  return (
    <>
      <LayerTitleWrap>
        <Box gap="hair">
          <LayerTitle>
            {`${intl.formatMessage(messages.settingsTabTitle)} ${getLayerTitle({
              intl,
              config,
              short: true,
            })}`}
          </LayerTitle>
        </Box>
        {onLayerInfo && (
          <LayerButtonInfo onClick={onLayerInfo} icon={<Info />} />
        )}
      </LayerTitleWrap>
      <Settings>
        {geometries &&
          geometries.map((geo, index) => {
            const layerGeoSettings = layerSettings.reduce((memo, setting) => {
              const [geoIndex, keyValue] = setting.split('-');
              if (`g${index}` === geoIndex) {
                const [key, value] = keyValue.split(':');
                return {
                  ...memo,
                  [key]: value,
                };
              }
              return memo;
            }, {});
            const hasActive = !!geo.settings.active;
            let isActiveOn = hasActive && geo.settings.active.default;
            if (layerGeoSettings.active) {
              isActiveOn =
                qe(layerGeoSettings.active, 1) ||
                qe(layerGeoSettings.active, 'true');
            }
            return (
              <GeoSettings key={geo.file}>
                {Object.keys(geo.settings).map(settingKey => {
                  const setting = geo.settings[settingKey];
                  let checked = setting.default;
                  if (layerGeoSettings[settingKey]) {
                    checked =
                      qe(layerGeoSettings[settingKey], 1) ||
                      qe(layerGeoSettings[settingKey], 'true');
                  }
                  const isSecondary = settingKey !== 'active' && hasActive;
                  const isDisabled = isSecondary && !isActiveOn;
                  if (setting && setting.type === 'checkbox' && setting.label) {
                    return (
                      <Setting
                        secondary={isSecondary}
                        key={settingKey}
                        isDisabled={isDisabled}
                      >
                        <Checkbox
                          checked={checked}
                          isDisabled={isDisabled}
                          onToggle={() => {
                            const updatedArg = `${
                              config.id
                            }_g${index}-${settingKey}`;
                            const value = checked ? '0' : '1';
                            const argValue = `${updatedArg}:${value}`;
                            // update previous settings
                            let updated = layerGeometries.map(lg => {
                              if (startsWith(lg, updatedArg)) {
                                return argValue;
                              }
                              return lg;
                            });
                            // add new settings
                            if (updated.indexOf(argValue) < 0) {
                              updated = [...updated, argValue];
                            }
                            onSetLayerGeometries(updated);
                          }}
                          styledLabel={
                            <MarkdownText
                              size="xsmall"
                              content={
                                setting.label[locale] ||
                                setting.label[DEFAULT_LOCALE]
                              }
                            />
                          }
                        />
                      </Setting>
                    );
                  }
                  if (setting && setting.type === 'toggle' && setting.options) {
                    const labelOn = setting.options.true
                      ? setting.options.true.label[locale] ||
                        setting.options.true.label[DEFAULT_LOCALE]
                      : 'on';
                    const labelOff = setting.options.false
                      ? setting.options.false.label[locale] ||
                        setting.options.false.label[DEFAULT_LOCALE]
                      : 'off';
                    return (
                      <Setting
                        secondary={isSecondary}
                        isDisabled={isDisabled}
                        key={settingKey}
                      >
                        <ToggleOnOff
                          labelSize="xsmall"
                          labelOn={labelOn}
                          labelOff={labelOff}
                          value={checked ? '1' : '0'}
                          isDisabled={isDisabled}
                          onChange={value => {
                            const updatedArg = `${
                              config.id
                            }_g${index}-${settingKey}`;
                            const argValue = `${updatedArg}:${value}`;
                            // update previous settings
                            let updated = layerGeometries.map(lg => {
                              if (startsWith(lg, updatedArg)) {
                                return argValue;
                              }
                              return lg;
                            });
                            // add new settings
                            if (updated.indexOf(argValue) < 0) {
                              updated = [...updated, argValue];
                            }
                            onSetLayerGeometries(updated);
                          }}
                        />
                      </Setting>
                    );
                  }
                  return <div key={settingKey}>{settingKey}</div>;
                })}
              </GeoSettings>
            );
          })}
      </Settings>
    </>
  );
}

LayerSettings.propTypes = {
  config: PropTypes.object,
  layerGeometries: PropTypes.array,
  onSetLayerGeometries: PropTypes.func,
  onLayerInfo: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(LayerSettings);
