export const ROUTES = {
  HOME: '',
  EXPLORE: 'explore',
  ANALYSE: 'analyse',
  PAGE: 'page',
};

export const PATHS = {
  DATA: './content/data',
  CONTENT:
    process && process.env && process.env.NODE_ENV === 'production'
      ? './content'
      : 'https://unfolddata.github.io/marine-plastic-explorer/content',
  IMAGES:
    process && process.env && process.env.NODE_ENV === 'production'
      ? './assets/uploads'
      : 'https://unfolddata.github.io/marine-plastic-explorer/assets/uploads',
};

export const PAGES = {
  about: {
    path: 'about',
  },
};

export const MAX_LOAD_ATTEMPTS = 5;

export const MAPBOX = {
  TOKEN: 'pk.eyJ1IjoidG1mcm56IiwiYSI6IkRNZURKUHcifQ._ljgPcF75Yig1Of8adL93A',
  USER: 'tmfrnz',
  BASEMAP_STYLES: {
    light: 'ckae0r0to0say1ir3a13wvscu',
    satellite: 'ckacdj3yp5pmb1iqky0khmlc8',
  },
  RASTER_URL_TEMPLATE:
    'https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}',
  STYLE_URL_TEMPLATE:
    'https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}',
};
