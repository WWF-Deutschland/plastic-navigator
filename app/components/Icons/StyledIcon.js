import React from 'react';
import styled, { withTheme } from 'styled-components';

const parseMetricToNum = string => parseFloat(string.match(/\d+(\.\d+)?/), 10);

const StyledIcon = styled(({ a11yTitle, color, theme, stroke, ...rest }) => (
  <svg
    fill={theme.global.colors[color] || color}
    stroke={stroke || 'none'}
    aria-label={a11yTitle}
    {...rest}
  />
))`
  display: inline-block;
  flex: 0 0 auto;

  ${({ size = 'xlarge', theme, viewBox }) => {
    const [, , w, h] = (viewBox || '0 0 24 24').split(' ');
    const scale = w / h;
    const dimension = parseMetricToNum(theme.icon.size[size] || size);

    if (w < h) {
      return `
      width: ${dimension}px;
      height: ${dimension / scale}px;
    `;
    }
    if (h < w) {
      return `
      width: ${dimension * scale}px;
      height: ${dimension}px;
    `;
    }
    return `
      width: ${dimension}px;
      height: ${dimension}px;
    `;
  }}
`;

export default withTheme(StyledIcon);
