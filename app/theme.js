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
    height: [50, 50, 95, 95, 95],
    zIndex: 1200,
    primaryIcons: 40,
  },
  aside: {
    // by breakpoint
    width: [0, 0, 350, 420, 550],
    zIndex: 1150,
  },
  realmIcons: {
    single: 68,
    multi: 42,
  },
  topGraphic: {
    // by breakpoint
    height: [300, 300, 350, 420, 550],
  },
  mainContent: {
    zIndex: 1100,
    // by breakpoint
    maxWidth: [700, 700, 700, 800, 900],
  },
  home: {
    maxWidth: [700, 700, 1000, 1100, 1200],
  },
  settings: {
    height: {
      small: 40,
      large: 110,
    },
  },
};

export const colors = {
  // used by grommet
  // active, text, border, ...
  // also see https://github.com/grommet/grommet/wiki/Grommet-v2-theming-documentation
  // and https://github.com/grommet/grommet/blob/master/src/js/themes/base.js
  black: '#000000',
  dark: '#999999',
  white: '#ffffff',
  // active: '#ffffff',
  brand: '#AD190F',
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
  // realms: {
  //   T: '',
  //   M: '',
  //   F: '',
  //   S: '',
  // },
  header: {
    background: '#000000',
  },
};

// grommet text
const text = {
  xxsmall: { size: '12px', height: '14px', maxWidth: '500px' },
  xsmall: { size: '13px', height: '16px', maxWidth: '600px' },
  small: { size: '14px', height: '18px', maxWidth: '700px' },
  medium: { size: '16px', height: '21px', maxWidth: '800px' },
  large: { size: '18px', height: '24px', maxWidth: '800px' },
  xlarge: { size: '22px', height: '30px', maxWidth: '800px' },
  xxlarge: { size: '30px', height: '36px', maxWidth: '800px' },
  xxxlarge: { size: '60px', height: '75px', maxWidth: '800px' },
};
// grommet paddings and margins
const edgeSize = {
  hair: '1px',
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
      height: '22px',
      size: '16px',
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
        color: 'rgba(0, 0, 0, 0.7)',
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
      zIndex: 1200,
    },
  },
  rangeInput: {
    thumb: {
      color: 'black',
    },
    track: {
      color: colors.dark,
      //   height: '4px',
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
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
    },
    zIndex: 1300,
  },
};

export default theme;
