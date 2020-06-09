import { dimensions, sizes } from 'theme';

// if a given size is larger than a reference size
const isMinXXLarge = size => size === 'xxlarge';
const isMinXLarge = size => isMinXXLarge(size) || size === 'xlarge';
const isMinLarge = size => isMinXLarge(size) || size === 'large';
const isMinMedium = size => isMinLarge(size) || size === 'medium';
const isMinSmall = () => true;

export const isMinSize = (currentSize, checkSize) => {
  if (checkSize === 'small') return isMinSmall(currentSize);
  if (checkSize === 'medium') return isMinMedium(currentSize);
  if (checkSize === 'large') return isMinLarge(currentSize);
  if (checkSize === 'xlarge') return isMinXLarge(currentSize);
  if (checkSize === 'xxlarge') return isMinXXLarge(currentSize);
  return false;
};

// If a given size is smaller than a reference size
const isMaxXXLarge = () => true;
const isMaxXLarge = size => isMaxLarge(size) || size === 'xlarge';
const isMaxLarge = size => isMaxMedium(size) || size === 'large';
const isMaxMedium = size => isMaxSmall(size) || size === 'medium';
const isMaxSmall = size => size === 'small';

export const isMaxSize = (currentSize, checkSize) => {
  if (checkSize === 'small') return isMaxSmall(currentSize);
  if (checkSize === 'medium') return isMaxMedium(currentSize);
  if (checkSize === 'large') return isMaxLarge(currentSize);
  if (checkSize === 'xlarge') return isMaxXLarge(currentSize);
  if (checkSize === 'xxlarge') return isMaxXXLarge(currentSize);
  return false;
};

export const getWindowDimensions = () => {
  // const { innerWidth: width, innerHeight: height } = window;
  if (document.compatMode === 'BackCompat') {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    };
  }
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
};

export const getSize = width =>
  sizes.find(s => width >= s.min && width <= s.max);

export const getHeaderHeight = size => {
  const bp = sizes[size];
  return bp && size
    ? dimensions.header.height[bp.index]
    : dimensions.header.height[0];
};

export const getAsideWidth = size => {
  const bp = sizes[size];
  return bp && size
    ? dimensions.aside.width[bp.index]
    : dimensions.aside.width[0];
};

export const getTopGraphicHeight = size => {
  const bp = sizes[size];
  return bp && size
    ? dimensions.topGraphic.height[bp.index]
    : dimensions.topGraphic.height[0];
};
export const getContentMaxWidth = size => {
  const bp = sizes[size];
  return bp && size
    ? dimensions.mainContent.maxWidth[bp.index]
    : dimensions.mainContent.maxWidth[0];
};
export const getHomeMaxWidth = size => {
  const bp = sizes[size];
  return bp && size
    ? dimensions.home.maxWidth[bp.index]
    : dimensions.home.maxWidth[0];
};
