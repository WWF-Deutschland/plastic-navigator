(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{ea6b6d2a76346abcbd96:function(e,t,n){"use strict";n.r(t);var r,o=n("8af190b70a6bc55c6f1b"),a=n.n(o),i=n("0d7f0986bcd2f33d8a2a"),c=(n("8a2d1b95e05b6a321e74"),n("d7dd51e1bf6bfc2c9c3d")),l=n("ab4cb61bcb2dc161defb"),f=n("a28fc3c963a1d4d1a2e5"),u=n("0b3cb19af78752326f59"),d=n("ab039aecd4a1d4fedc0e"),s=n("6542cd13fd5dd1bcffd4"),p=n("a72b40110d9c31c9b5c5"),m=n("eb656803928a435bd3cc"),b=n("66543f9bb6e90e461320"),h=n("5ca68c6edf7ca33c5f8f"),y=n("761b1f7fdd256e4f5426"),g=n("25c6f348de9dd6a08927"),w=n("3cae2174b17d59d30571"),v=n("32d542d3672358c449fc"),O=n("52adfcd94964956e8460"),C=n("0785de3f40b134973d35"),j=n("d6f259ffb10cc810b5a4"),_=n("455f30c6322408a2ff3e"),x="app.containers.PanelChapter",S=Object(d.defineMessages)({next:{id:"".concat(x,".next"),defaultMessage:"Next"},exploreAll:{id:"".concat(x,".exploreAll"),defaultMessage:"Explore all layers"}});function E(e,t,n,o){r||(r="function"===typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var a=e&&e.defaultProps,i=arguments.length-3;if(t||0===i||(t={children:void 0}),1===i)t.children=o;else if(i>1){for(var c=new Array(i),l=0;l<i;l++)c[l]=arguments[l+3];t.children=c}if(t&&a)for(var f in a)void 0===t[f]&&(t[f]=a[f]);else t||(t=a||{});return{$$typeof:r,type:e,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}function L(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"===typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,o=!1,a=void 0;try{for(var i,c=e[Symbol.iterator]();!(r=(i=c.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(e){o=!0,a=e}finally{try{r||null==c.return||c.return()}finally{if(o)throw a}}return n}(e,t)||function(e,t){if(!e)return;if("string"===typeof e)return P(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return P(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function P(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function I(){return(I=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var N=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{direction:"row",gap:"hair"}))}).withConfig({displayName:"PanelChapter__Styled",componentId:"t1wy89-0"})(["position:absolute;left:0;right:0;bottom:30px;width:100%;height:200px;pointer-events:all;z-index:4000;@media (min-width:","){right:auto;width:auto;bottom:40px;}"],function(e){return e.theme.sizes.medium.minpx}),A=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{fill:"vertical",align:"center",pad:"small",background:"black",elevation:"small",flex:{shrink:0}}))}).withConfig({displayName:"PanelChapter__ToggleWrap",componentId:"t1wy89-1"})(["width:40px;"]),k=Object(u.default)(function(e){return a.a.createElement(b.a,I({},e,{plain:!0}))}).withConfig({displayName:"PanelChapter__ButtonToggle",componentId:"t1wy89-2"})([""]),M=Object(u.default)(g.a).withConfig({displayName:"PanelChapter__MenuOpen",componentId:"t1wy89-3"})(["transform:rotate(90deg);"]),F=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{direction:"row",gap:"hair",fill:"horizontal"}))}).withConfig({displayName:"PanelChapter__ContentWrap",componentId:"t1wy89-4"})(["position:relative;"]),T=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{background:"black",pad:"small",fill:"horizontal",elevation:"small"}))}).withConfig({displayName:"PanelChapter__Content",componentId:"t1wy89-5"})(["@media (min-width:","){width:300px;}"],function(e){return e.theme.sizes.medium.minpx}),z=Object(u.default)(h.a).withConfig({displayName:"PanelChapter__Title",componentId:"t1wy89-6"})(["font-size:22px;line-height:24px;margin-top:0;margin-bottom:5px;font-family:'wwfregular';font-weight:normal;letter-spacing:0.05em;text-transform:uppercase;"]),B=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{direction:"row",gap:"small"}))}).withConfig({displayName:"PanelChapter__ButtonWrap",componentId:"t1wy89-7"})(["position:absolute;bottom:0;right:",";transform:translateY(50%);"],function(e){return e.theme.global.edgeSize.small}),D=Object(u.default)(function(e){return a.a.createElement(b.a,I({},e,{reverse:!0,plain:!0}))}).withConfig({displayName:"PanelChapter__ButtonNext",componentId:"t1wy89-8"})(["background:",";color:",";border-radius:20px;padding:5px 15px;"],function(e){return e.theme.global.colors.brand},function(e){return e.theme.global.colors.white}),U=Object(u.default)(function(e){return a.a.createElement(D,e)}).withConfig({displayName:"PanelChapter__ButtonPrevious",componentId:"t1wy89-9"})([""]),W=Object(u.default)(h.a).withConfig({displayName:"PanelChapter__Description",componentId:"t1wy89-10"})([""]),$=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{direction:"row",gap:"small"}))}).withConfig({displayName:"PanelChapter__LayersFocusWrap",componentId:"t1wy89-11"})([""]),J=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{fill:"horizontal"}))}).withConfig({displayName:"PanelChapter__LayerFocus",componentId:"t1wy89-12"})([""]),q=Object(u.default)(function(e){return a.a.createElement(m.a,I({},e,{direction:"row",align:"center",margin:{bottom:"xxsmall"}}))}).withConfig({displayName:"PanelChapter__LayerTitleWrap",componentId:"t1wy89-13"})([""]),H=Object(u.default)(h.a).withConfig({displayName:"PanelChapter__LayerTitle",componentId:"t1wy89-14"})(["font-size:15px;font-weight:bold;"]),Y=Object(u.default)(function(e){return a.a.createElement(b.a,e)}).withConfig({displayName:"PanelChapter__LayerButtonInfo",componentId:"t1wy89-15"})(["margin-left:",";"],function(e){return e.stretch?"auto":0}),G=2,K="PanelChapter",Q={open:!0},R=E(M,{}),V=E(g.a,{}),X=E(w.a,{}),Z=E(v.a,{color:"white"}),ee=E(O.a,{color:"white"});var te=Object(f.b)({exploreConfig:function(e){return Object(s.i)(e)},locale:function(e){return Object(s.m)(e)},uiState:function(e){return Object(s.u)(e,{key:K})}});var ne,re=Object(c.connect)(te,function(e){return{onSetOpen:function(t,n){return e(Object(p.r)(K,Object.assign({},Q,n,{open:t})))},onLayerInfo:function(t){return e(Object(p.n)(t))},onSetLayers:function(t){return e(Object(p.o)(t))},navModule:function(t){return j.f[t]&&e(Object(p.c)(j.f[t].path))}}}),oe=Object(l.compose)(re)(function(e){var t=e.onPrevious,n=e.onNext,r=e.onSetLayers,i=e.locale,c=e.chapter,l=e.isFirst,f=e.isLast,u=e.uiState,s=e.onSetOpen,p=e.onLayerInfo,m=e.layersConfig,b=e.navModule,h=(u?Object.assign({},Q,u):Q).open,g=L(Object(o.useState)(0),2),w=g[0],v=g[1];Object(o.useEffect)(function(){c&&r(c.layers||[])},[c]);var O=c&&c.layersFocus&&m&&m.filter(function(e){return c.layersFocus.slice(0,2).indexOf(e.id)>-1});return E(y.a.Consumer,{},void 0,function(e){return E(N,{},void 0,E(A,{},void 0,E(k,{icon:h?R:V,onClick:function(){return s(!h)}})),h&&E(F,{},void 0,("small"!==e||0===w)&&E(T,{},void 0,c&&i&&E(z,{},void 0,c.title[i]||c.title[C.DEFAULT_LOCALE]),O&&O.length>0&&E($,{},void 0,O.map(function(e){return E(J,{},e.id,E(q,{fill:1===O.length&&"horizontal"},void 0,i&&E(H,{},void 0,e["title-short"]&&(e["title-short"][i]||e["title-short"][C.DEFAULT_LOCALE]),!e["title-short"]&&(e.title[i]||e.title[C.DEFAULT_LOCALE])),E(Y,{onClick:function(){return p(e["content-id"]||e.id)},icon:X,stretch:1===O.length})),E(_.a,{config:e,simple:!0,dark:!0}))}))),("small"!==e||1===w)&&E(T,{},void 0,c&&i&&E(W,{},void 0,c.description[i]||c.description[C.DEFAULT_LOCALE])),E(B,{},void 0,(!l||"small"===e&&w>0)&&E(U,{icon:Z,onClick:function(){"small"===e?(w>0&&v(w-1),0===w&&(l||v(G-1),p(),t())):(p(),t())}}),!f&&E(D,{icon:ee,label:a.a.createElement(d.FormattedMessage,S.next),onClick:function(){"small"===e?(w<G-1&&v(w+1),w===G-1&&(f||v(0),p(),n())):(p(),n())}}),f&&E(D,{label:a.a.createElement(d.FormattedMessage,S.exploreAll),onClick:function(){b("explore")}}))))})}),ae=n("f9c0d22799479965d07c"),ie=n("02ed36e7ccc5625439c9");function ce(e,t,n,r){ne||(ne="function"===typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var o=e&&e.defaultProps,a=arguments.length-3;if(t||0===a||(t={children:void 0}),1===a)t.children=r;else if(a>1){for(var i=new Array(a),c=0;c<a;c++)i[c]=arguments[c+3];t.children=i}if(t&&o)for(var l in o)void 0===t[l]&&(t[l]=o[l]);else t||(t=o||{});return{$$typeof:ne,type:e,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}n.d(t,"ModuleStories",function(){return fe});var le=u.default.div.withConfig({displayName:"ModuleStories__Styled",componentId:"sc-132en5s-0"})([""]);function fe(e){var t=e.layersConfig,n=e.storiesConfig,r=e.onPrevious,a=e.onNext,c=e.story,l=e.chapter,f=e.onSetStory,u=e.onSetChapter,d=e.onSetLanding,s=e.firstLanding,p=e.intl;if(Object(o.useEffect)(function(){s&&d()},[]),Object(o.useEffect)(function(){c||f(0),l||u(0)}),!n)return null;var m=1===n.length?n[0]:n[c],b=m.chapters&&m.chapters.length>0&&m.chapters[l];return ce(le,{},void 0,ce(i.Helmet,{},void 0,ce("title",{},void 0,"".concat(p.formatMessage(ie.a.module_stories_metaTitle)))),ce(ae.a,{},void 0,t&&m.chapters&&l<m.chapters.length&&ce(oe,{onPrevious:function(){return r(l)},onNext:function(){a(l,m.chapters.length)},chapter:b,isFirst:0===l,isLast:l===m.chapters.length-1,layersConfig:t.filter(function(e){return b&&b.layers&&b.layers.indexOf(e.id)>-1})})))}var ue=Object(f.b)({layersConfig:function(e){return Object(s.l)(e)},storiesConfig:function(e){return Object(s.s)(e)},story:function(e){return Object(s.t)(e)},chapter:function(e){return Object(s.b)(e)},firstLanding:function(e){return Object(s.j)(e)}});var de=Object(c.connect)(ue,function(e){return{onNext:function(t,n){return e(Object(p.f)(Math.min(t+1,n)))},onPrevious:function(t){return e(Object(p.f)(Math.max(t-1,0)))},onSetChapter:function(t){return e(Object(p.f)(t))},onSetStory:function(t){return e(Object(p.q)(t))},onSetLanding:function(){return e(Object(p.m)())}}});t.default=Object(l.compose)(de)(Object(d.injectIntl)(fe))}}]);