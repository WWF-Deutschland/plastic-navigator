import { DocumentText, Layer } from 'grommet-icons';
import React from 'react';

// application routes and paths
export const ROUTES = {
  INTRO: 'stories',
  EXPLORE: 'explore',
  ANALYSE: 'analyse',
};

export const PAGES = {
  about: {
    path: 'about',
  },
  glossary: {
    path: 'glossary',
  },
};
export const MODULES = {
  stories: {
    path: ROUTES.INTRO,
    icon: <DocumentText color="white" />,
  },
  explore: {
    path: ROUTES.EXPLORE,
    icon: <Layer color="white" />,
  },
};

// data/config & content locations

// use local, relative resources for production and remote resources during development
export const RESOURCES = {
  // TODO: consider local resource for data
  DATA:
    process && process.env && process.env.NODE_ENV === 'production'
      ? './data'
      : 'https://wwf-deutschland.github.io/marine-plastic-explorer/data',
  // resources are generated by jekyll as a static site, path is determined by resource permalink
  CONTENT:
    process && process.env && process.env.NODE_ENV === 'production'
      ? './content'
      : 'https://wwf-deutschland.github.io/marine-plastic-explorer/content',
  IMAGES:
    process && process.env && process.env.NODE_ENV === 'production'
      ? './assets/uploads'
      : 'https://wwf-deutschland.github.io/marine-plastic-explorer/assets/uploads',
};

export const LAYER_CONTENT_PATH = 'layers';

export const CONFIG = {
  stories: 'stories.json',
  explore: 'explore.json',
  layers: 'layers.json',
  projects: {
    file: 'projects.csv',
    type: 'csv',
  },
};

export const POLICY_LAYER = 'policy-commitments';
export const PROJECT_CATEGORY = 'projects';
export const PROJECT_CONFIG = {
  type: 'csv',
  source: 'data',
  file: 'layers/project_locations.csv',
  id: 'projects',
  data: {
    'layer-id': 'project_id',
  },
  render: {
    type: 'marker',
  },
  icon: {
    size: { x: '34', y: '47' },
    align: 'bottom',
    datauri: {
      default:
        'data:image/png;base64,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',
      active:
        'data:image/png;base64,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',
      'semi-active':
        'data:image/png;base64,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',
    },
    datauriYellow: {
      default:
        'data:image/png;base64,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',
      active:
        'data:image/png;base64,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',
      'semi-active':
        'data:image/png;base64,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',
    },
  },
  tooltip: {
    supTitle: {
      propertyByLocale: {
        en: 'location_title_en',
        de: 'location_title_en',
      },
    },
    title: {
      propertyFromLayer: {
        propertyByLocale: {
          en: 'project_title_en',
          de: 'project_title_en',
        },
      },
    },
    more: 'true',
  },
};

export const MAX_LOAD_ATTEMPTS = 5;

// map config

export const MAPBOX = {
  TOKEN: 'pk.eyJ1IjoidG1mcm56IiwiYSI6IkRNZURKUHcifQ._ljgPcF75Yig1Of8adL93A',
  USER: 'tmfrnz',
  RASTER_URL_TEMPLATE:
    'https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}',
  STYLE_URL_TEMPLATE:
    'https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}',
};

export const URL_SEARCH_SEPARATOR = '|';

export const MAP_OPTIONS = {
  CENTER: [20, 180],
  ZOOM: {
    INIT: 2,
    MIN: 2,
    MAX: 7,
  },
  BOUNDS: {
    N: 85,
    W: -180,
    S: -85,
    E: 540,
  },
};
