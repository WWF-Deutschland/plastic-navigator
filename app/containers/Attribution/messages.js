/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Attribution';

export default defineMessages({
  copyright: {
    id: `${scope}.copyright`,
    defaultMessage: '©WWF',
  },
  appByLabel: {
    id: `${scope}.appByLabel`,
    defaultMessage: 'Interactive by',
  },
  appBy: {
    id: `${scope}.appBy`,
    defaultMessage: 'dumpark',
  },
  appByURL: {
    id: `${scope}.appByURL`,
    defaultMessage: '//dumpark.com',
  },
  imprintLabel: {
    id: `${scope}.imprintLabel`,
    defaultMessage: 'Imprint',
  },
  imprintURL: {
    id: `${scope}.imprintURL`,
    defaultMessage: '//www.wwf.de/impressum',
  },
  mapAttributionLabel: {
    id: `${scope}.mapAttributionLabel`,
    defaultMessage: 'Map attribution',
  },
  mapAttributionLayersTitle: {
    id: `${scope}.mapAttributionLayersTitle`,
    defaultMessage: 'Map layers',
  },
  mapAttributionLayersInfo: {
    id: `${scope}.mapAttributionLayersInfo`,
    defaultMessage:
      'For layer specific references and attribution please refer to the individual layer descriptions',
  },
  mapAttributionBasemapTitle: {
    id: `${scope}.mapAttributionBasemapTitle`,
    defaultMessage: 'Basemap',
  },
  mapAttributionBasemapInfo: {
    id: `${scope}.mapAttributionBasemapInfo`,
    defaultMessage: 'Landmass data by Natural Earth (naturalearthdata.com)',
  },
});
