import { createGlobalStyle } from 'styled-components';
import WWFFontWoff from './fonts/wwf-webfont.woff';
import WWFFontTTF from './fonts/wwf-webfont.ttf';
import WWFFontEOT from './fonts/wwf-webfont.eot';

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
    font-size: 13px;
    line-height: 16px;
  }

  .mpx-layer-lead {
    font-size: 20px;
    font-weight: 600;
    // compare theme.js colors.brand
    color: #00728F;
  }
  .mpx-content h1,
  .mpx-content h2,
  .mpx-content h3,
  .mpx-content h4 {
    font-family: 'wwfregular';
    font-weight: normal;
    letter-spacing: 0.05em;
    font-size: 24px;
  }
  .mpx-content h4 {
    font-size: 20px;
  }
  figure {
    margin: 0;
  }
  .mpx-wrap-markdown-intro p {
    margin: 0;
    line-height: 21px
  }
`;

export default GlobalStyle;
