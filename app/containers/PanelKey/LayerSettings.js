import React from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_LOCALE } from 'i18n';
import { injectIntl, intlShape } from 'react-intl';
import Checkbox from 'components/Checkbox';
import ToggleOnOff from 'components/ToggleOnOff';
import qe from 'utils/quasi-equals';
import { startsWith } from 'utils/string';

export function LayerSettings({
  config,
  layerGeometries,
  onSetLayerGeometries,
  intl,
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
  return (
    <div>
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
          return (
            <div key={geo.file}>
              {Object.keys(geo.settings).map(settingKey => {
                const setting = geo.settings[settingKey];
                let checked = setting.default;
                if (layerGeoSettings[settingKey]) {
                  checked =
                    qe(layerGeoSettings[settingKey], 1) ||
                    qe(layerGeoSettings[settingKey], 'true');
                }
                if (setting && setting.type === 'checkbox' && setting.label) {
                  return (
                    <div key={settingKey}>
                      <Checkbox
                        checked={checked}
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
                        label={
                          setting.label[locale] || setting.label[DEFAULT_LOCALE]
                        }
                      />
                    </div>
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
                    <div key={settingKey}>
                      <ToggleOnOff
                        labelOn={labelOn}
                        labelOff={labelOff}
                        value={checked ? '1' : '0'}
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
                    </div>
                  );
                }
                return <div key={settingKey}>{settingKey}</div>;
              })}
            </div>
          );
        })}
    </div>
  );
}
// <Checkbox
// checked={checked}
// onToggle={() => {
//   const updatedArg = `${
//     config.id
//   }_g${index}-${settingKey}`;
//   const value = checked ? '0' : '1';
//   const argValue = `${updatedArg}:${value}`;
//   // update previous settings
//   let updated = layerGeometries.map(lg => {
//     if (startsWith(lg, updatedArg)) {
//       return argValue;
//     }
//     return lg;
//   });
//   // add new settings
//   if (updated.indexOf(argValue) < 0) {
//     updated = [...updated, argValue];
//   }
//   onSetLayerGeometries(updated);
// }}
// label="small states only"
// />

LayerSettings.propTypes = {
  config: PropTypes.object,
  layerGeometries: PropTypes.array,
  onSetLayerGeometries: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(LayerSettings);
