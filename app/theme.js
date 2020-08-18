import { reduce } from 'lodash/collection';

// theme defining breakpoints, colors, sizes, grid gutters
export const sizes = {
  small: {
    min: 0,
    max: 720, // inclusive
    name: 'mobile',
    index: 0,
  },
  medium: {
    min: 721,
    max: 992,
    name: 'tablet (portrait)',
    index: 1,
  },
  large: {
    min: 993,
    max: 1152,
    name: 'laptop/tablet (landscape)',
    index: 2,
  },
  xlarge: {
    min: 1153,
    max: 1728,
    name: 'desktop',
    index: 3,
  },
  xxlarge: {
    min: 1729,
    max: 99999999,
    name: 'large desktop',
    index: 4,
  },
};

export const dimensions = {
  header: {
    // by breakpoint
    height: [50, 50, 60, 60, 60],
    zIndex: 3000,
  },
  // layer select
  aside: {
    // by breakpoint
    width: [0, 350, 350, 420, 500],
    zIndex: 1150,
  },
  // layer info
  asideInfo: {
    // by breakpoint
    width: [0, 0, 400, 500, 600],
    zIndex: 1150,
  },
};

export const colors = {
  // used by grommet
  // active, text, border, ...
  // also see https://github.com/grommet/grommet/wiki/Grommet-v2-theming-documentation
  // and https://github.com/grommet/grommet/blob/master/src/js/themes/base.js
  black: '#000000',
  'black-trans': 'rgba(0, 0, 0, 0.6)',
  dark: '#282A2C',
  white: '#ffffff',
  'white-trans': 'rgba(255, 255, 255, 0.85)',
  // active: '#ffffff',
  brand: '#00728F',
  brandDark: '#08586C',
  brandDarker: '#074E5F',
  brandLight: '#AFD3DD',
  light: '#F0F0F0',
  'light-trans': 'rgba(243, 243, 243, 0.7)',
  lightHover: '#E3E3E3',
  focus: '#333333',
  hover: '#AD190F',
  // placeholder: '#ffffff',
  text: {
    dark: '#ffffff', // on dark background
    light: '#000000', // on light background
  },
  border: {
    dark: '#ffffff', // on dark background
    light: '#dddddd', // on light background
  },
  // other custom colours (also understood by grommet conmponents)
  map: '#fdfdfd',
};

// grommet text
const text = {
  xxsmall: { size: '12px', height: '14px', maxWidth: '500px' },
  xsmall: { size: '13px', height: '16px', maxWidth: '600px' },
  small: { size: '14px', height: '18px', maxWidth: '700px' },
  medium: { size: '15px', height: '20px', maxWidth: '800px' },
  large: { size: '18px', height: '24px', maxWidth: '800px' },
  xlarge: { size: '22px', height: '30px', maxWidth: '800px' },
  xxlarge: { size: '30px', height: '36px', maxWidth: '800px' },
  xxxlarge: { size: '60px', height: '75px', maxWidth: '800px' },
};
// grommet paddings and margins
const edgeSize = {
  hair: '1px',
  xxxsmall: '3px',
  xxsmall: '3px',
  xsmall: '6px',
  small: '12px',
  ms: '16px',
  medium: '24px',
  ml: '36px',
  large: '48px',
  xlarge: '64px',
  xxlarge: '100px',
};
// grommet icon size
const icon = {
  size: {
    small: '14px',
    medium: '17px',
    large: '20px',
    xlarge: '24px',
    xxlarge: '32px',
  },
};

const theme = {
  dimensions,
  sizes: reduce(
    sizes,
    (sizespx, s, key) => ({
      ...sizespx,
      [key]: {
        ...s,
        minpx: `${s.min}px`,
        maxpx: `${s.max}px`,
      },
    }),
    {},
  ),
  // used for grommet
  icon,
  text,
  paragraph: text,
  global: {
    // margins & paddings
    edgeSize,
    font: {
      // family: 'Source Sans Pro',
      height: '20px',
      size: '15px',
    },
    colors,
    input: {
      padding: '2px',
      weight: 400,
    },
    breakpoints: {
      small: {
        value: sizes.small.max,
      },
      medium: {
        value: sizes.medium.max,
      },
      large: {
        value: sizes.large.max,
      },
      xlarge: {
        value: sizes.xlarge.max,
      },
      xxlarge: {},
    },
    spacing: '18px',
    focus: {
      // shadow or outline are required for accessibility
      border: {
        color: 'transparent',
      },
      // not effective?
      outline: { color: 'red', size: '1px' },
      // not effective?
      shadow: {
        color: 'rgb(255, 0, 0)',
        size: '1px',
      },
    },
    drop: {
      zIndex: 9999,
    },
  },
  checkBox: {
    size: '20px',
    gap: 'xsmall',
    // CHECKED: The stroke color for the CheckBox icon, and the border when checked.
    color: 'black',
    // HOVER
    hover: {
      border: {
        color: 'black',
      },
    },
    // UNCHECKED
    border: {
      // The border color when unchecked.
      color: 'black',
      // The border width when unchecked.
      width: '1.5px',
    },
    check: {
      radius: '4px',
      thickness: '3px',
    },
  },
  layer: {
    border: {
      radius: 0,
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
    },
    zIndex: 3002,
  },
};

export default theme;
