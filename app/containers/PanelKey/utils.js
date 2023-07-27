/**
 *
 * Key
 *
 */
import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG, POLICY_LAYER } from 'config';
import { getTopicTitle, getTopicMapAnnotation } from 'utils/policy';
import messages from './messages';

export const getLayerTitle = ({
  intl,
  config,
  jsonLayerInfo,
  indicatorId,
  short,
}) => {
  const { locale } = intl;
  let title = 'no title';
  if (config) {
    if (
      config.id === POLICY_LAYER &&
      config['title-short'] &&
      jsonLayerInfo &&
      indicatorId
    ) {
      title =
        config['title-short'][locale] || config['title-short'][DEFAULT_LOCALE];
      // append
      title = `${title}: ${getTopicTitle({
        layerInfo: jsonLayerInfo,
        indicatorId,
        locale,
      })}`;
    } else if (config.id === PROJECT_CONFIG.id) {
      title = intl.formatMessage(messages.keyProjectsTitle);
    } else if (short && config['title-short']) {
      title =
        config['title-short'][locale] || config['title-short'][DEFAULT_LOCALE];
    } else if (config.title) {
      title = config.title[locale] || config.title[DEFAULT_LOCALE];
    }
  }
  return !title || title.trim() === '' ? 'title' : title;
};

export const getLayerAbout = ({ intl, config, jsonLayerInfo, indicatorId }) => {
  const { locale } = intl;
  let annotation;
  if (jsonLayerInfo && config.id === POLICY_LAYER) {
    annotation = getTopicMapAnnotation({
      layerInfo: jsonLayerInfo,
      indicatorId,
      locale,
    });
  } else if (config.id === PROJECT_CONFIG.id) {
    annotation = intl.formatMessage(messages.keyProjectsAbout);
  }
  if ((!annotation || annotation.trim() === '') && config && config.about) {
    annotation = config.about[locale] || config.about[DEFAULT_LOCALE];
  }
  return !annotation || annotation.trim() === '' ? 'about' : annotation;
};
