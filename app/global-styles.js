import { createGlobalStyle } from 'styled-components';
import WWFFontWoff from './fonts/wwf-webfont.woff';
import WWFFontTTF from './fonts/wwf-webfont.ttf';
import WWFFontEOT from './fonts/wwf-webfont.eot';
import { sizes } from './theme';
const GlobalStyle = createGlobalStyle`
  @import url('https://unpkg.com/leaflet@1.3.3/dist/leaflet.css');

  @font-face {
    font-family: 'wwfregular';
    src: url(${WWFFontEOT});
    src: url(${WWFFontEOT}) format('embedded-opentype'),
    url(${WWFFontWoff}) format('woff'),
    url(${WWFFontTTF}) format('truetype');
    font-weight: 300;
    font-style: normal;
    line-height: 1;
}

  html {
    scroll-behavior: smooth;
  }

  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    hyphenate-limit-chars: 8 3 3;
    @media (max-width: ${({ theme }) => theme.sizes.small.maxpx}) {
      hyphens: auto;
    }
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  sup, sub {
    vertical-align: baseline;
    position: relative;
    top: -0.4em;
  }
  sub {
    top: 0.4em;
  }

  #app {
    background-color: #fff;
    min-height: 100%;
    min-width: 100%;
  }

  .mpx-content li,
  p,
  label {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.5em;
  }

  .mpx-img {
    width: 100%;
  }
  .mpx-figcaption {
    text-align: right;
    font-size: 12px;
    line-height: 16px;
    color: #606367;
    padding-top: 4px;
  }

  .mpx-layer-lead {
    font-size: 18px;
    line-height: 25px;
    // compare theme.js colors.brand
    color: #00728F;
  }
  .mpx-content h1,
  .mpx-content h2,
  .mpx-content h3,
  .mpx-content h4 {
    font-family: 'wwfregular';
    font-weight: normal;
    line-height: 1;
    letter-spacing: 0.1px;
    font-size: 24px;
    margin-top: 40px;
    margin-bottom: 14px;
  }
  .mpx-content h1 {
    letter-spacing: 0.9px;
    font-size: 38px;
    line-height: 46px;
    margin-top: 0;
    margin-bottom: 30px;
    margin-right: 40px;
  }
  .mpx-content h4 {
    font-size: 20px;
  }
  .mpx-content a {
    color: #00728F;
    text-decoration-color: #00728F;
    &:visited{
      color: #00728F;
    }
    &:hover{
      color: #08586C;
    }
  }
  .mpx-content {
    font-size: 15px;
  }
  .mpx-content ul{
    padding-inline-start: 20px;
  }
  .mpx-content li{
    margin-bottom: 8px;
  }
  figure {
    margin: 0;
  }
  .mpx-wrap-markdown-description p {
    margin: 0;
    font-size: 12px;
    line-height: 15px;
    @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
      line-height: 16px;
    }
    @media (min-width: ${({ theme }) => theme.sizes.xlarge.minpx}) {
      font-size: 13px;
      line-height: 18px;
    }
  }
  .mpx-wrap-markdown-stat-title p {
    margin: 0;
    line-height: 14px;
  }
  .mpx-reference {
    color: #606367;
    font-size: 13px;
    line-height: 19px;
    margin-top: 50px;
    margin-bottom: 50px;
  }
  .mpx-reference h2,
  .mpx-reference h3,
  .mpx-reference h4,
  .mpx-reference h5,
  .mpx-reference h6 {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: bold;
  }
  .mpx-reference a {
    color: #606367;
    &:visited{
      color: #000000;
    }
    &:hover{
      color: #08586C;
    }
  }
  .mpx-modal .mpx-layer-content > p:first-child {
    font-size: 16px;
    @media (min-width: ${sizes.medium.min}px) {
      font-size: 18px;
    }
  }
  .mpx-topic-select p {
    margin: 0;
  }
  .mpx-markdown-text p {
    margin-top: 0;
    margin-block-start: 0;
    font-size: 15px;
    line-height: 22.5px;
  }
  .mpx-markdown-text li {
    margin-bottom: 0.5em;
    font-size: 15px;
    line-height: 22.5px;
  }
  .mpx-markdown-text a {
    color: #00728F;
  }
  .mpx-markdown-text a:hover {
    color: #08586C;
  }
  .mpx-markdown-text-settings p {
    line-height: 1.2;
  }
  .leaflet-layer .leaflet-mask.leaflet-interactive {
    cursor: initial !important;
  }
`;

export default GlobalStyle;
