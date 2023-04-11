/**
 *
 * Key
 *
 */
import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG, POLICY_LAYER } from 'config';
import { getTopicTitle, getTopicMapAnnotation } from 'utils/policy';
import messages from './messages';

export const getLayerTitle = ({ intl, config, jsonLayerInfo, indicatorId }) => {
  const { locale } = intl;
  let title = 'no title';
  if (config && config.title) {
    title = config.title[locale] || config.title[DEFAULT_LOCALE];
  }
  // append
  if (config.id === POLICY_LAYER && jsonLayerInfo && indicatorId) {
    title = `${title}: ${getTopicTitle({
      layerInfo: jsonLayerInfo,
      indicatorId,
      locale,
    })}`;
  }
  if (config.id === PROJECT_CONFIG.id) {
    title = intl.formatMessage(messages.keyProjectsTitle);
  }
  return title;
};

export const getLayerAbout = ({ intl, config, jsonLayerInfo, indicatorId }) => {
  const { locale } = intl;
  if (config && config.about) {
    return config.about[locale] || config.about[DEFAULT_LOCALE];
  }
  if (jsonLayerInfo && config.id === POLICY_LAYER) {
    return getTopicMapAnnotation({
      layerInfo: jsonLayerInfo,
      indicatorId,
      locale,
    });
  }
  if (config.id === PROJECT_CONFIG.id) {
    return intl.formatMessage(messages.keyProjectsAbout);
  }
  return 'about';
};
