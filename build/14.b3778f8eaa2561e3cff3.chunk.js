(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{ea6b6d2a76346abcbd96:function(e,t,n){"use strict";n.r(t);var r,o=n("8af190b70a6bc55c6f1b"),a=n.n(o),i=n("0d7f0986bcd2f33d8a2a"),c=(n("8a2d1b95e05b6a321e74"),n("d7dd51e1bf6bfc2c9c3d")),l=n("ab4cb61bcb2dc161defb"),f=n("a28fc3c963a1d4d1a2e5"),u=n("0b3cb19af78752326f59"),d=n("6542cd13fd5dd1bcffd4"),s=n("a72b40110d9c31c9b5c5"),p=n("ab039aecd4a1d4fedc0e"),m=n("eb656803928a435bd3cc"),h=n("66543f9bb6e90e461320"),b=n("5ca68c6edf7ca33c5f8f"),y=n("761b1f7fdd256e4f5426"),g=n("25c6f348de9dd6a08927"),w=n("3cae2174b17d59d30571"),v=n("32d542d3672358c449fc"),O=n("52adfcd94964956e8460"),C=n("0785de3f40b134973d35"),j=n("455f30c6322408a2ff3e"),_=Object(p.defineMessages)({next:{id:"".concat("app.containers.PanelChapter",".next"),defaultMessage:"Next"}});function x(e,t,n,o){r||(r="function"===typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var a=e&&e.defaultProps,i=arguments.length-3;if(t||0===i||(t={children:void 0}),1===i)t.children=o;else if(i>1){for(var c=new Array(i),l=0;l<i;l++)c[l]=arguments[l+3];t.children=c}if(t&&a)for(var f in a)void 0===t[f]&&(t[f]=a[f]);else t||(t=a||{});return{$$typeof:r,type:e,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}function S(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"===typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,o=!1,a=void 0;try{for(var i,c=e[Symbol.iterator]();!(r=(i=c.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(e){o=!0,a=e}finally{try{r||null==c.return||c.return()}finally{if(o)throw a}}return n}(e,t)||function(e,t){if(!e)return;if("string"===typeof e)return P(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return P(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function P(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function E(){return(E=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var I=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{direction:"row",gap:"hair"}))}).withConfig({displayName:"PanelChapter__Styled",componentId:"t1wy89-0"})(["position:absolute;left:0;right:0;bottom:30px;width:100%;height:200px;pointer-events:all;z-index:4000;@media (min-width:","){right:auto;width:auto;bottom:40px;}"],function(e){return e.theme.sizes.medium.minpx}),L=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{fill:"vertical",align:"center",pad:"small",background:"black",elevation:"small",flex:{shrink:0}}))}).withConfig({displayName:"PanelChapter__ToggleWrap",componentId:"t1wy89-1"})(["width:40px;"]),N=Object(u.default)(function(e){return a.a.createElement(h.a,E({},e,{plain:!0}))}).withConfig({displayName:"PanelChapter__ButtonToggle",componentId:"t1wy89-2"})([""]),k=Object(u.default)(g.a).withConfig({displayName:"PanelChapter__MenuOpen",componentId:"t1wy89-3"})(["transform:rotate(90deg);"]),A=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{direction:"row",gap:"hair",fill:"horizontal"}))}).withConfig({displayName:"PanelChapter__ContentWrap",componentId:"t1wy89-4"})(["position:relative;"]),F=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{background:"black",pad:"small",fill:"horizontal",elevation:"small"}))}).withConfig({displayName:"PanelChapter__Content",componentId:"t1wy89-5"})(["@media (min-width:","){width:300px;}"],function(e){return e.theme.sizes.medium.minpx}),z=Object(u.default)(b.a).withConfig({displayName:"PanelChapter__Title",componentId:"t1wy89-6"})(["font-size:22px;line-height:28px;margin-top:0;margin-bottom:16px;font-family:'wwfregular';text-transform:uppercase;font-weight:normal;letter-spacing:0.05em;"]),M=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{direction:"row",gap:"small"}))}).withConfig({displayName:"PanelChapter__ButtonWrap",componentId:"t1wy89-7"})(["position:absolute;bottom:0;right:",";transform:translateY(50%);"],function(e){return e.theme.global.edgeSize.small}),T=Object(u.default)(function(e){return a.a.createElement(h.a,E({},e,{reverse:!0,plain:!0}))}).withConfig({displayName:"PanelChapter__ButtonNext",componentId:"t1wy89-8"})(["background:",";color:",";border-radius:20px;padding:5px 15px;"],function(e){return e.theme.global.colors.brand},function(e){return e.theme.global.colors.white}),B=Object(u.default)(function(e){return a.a.createElement(T,e)}).withConfig({displayName:"PanelChapter__ButtonPrevious",componentId:"t1wy89-9"})([""]),D=Object(u.default)(b.a).withConfig({displayName:"PanelChapter__Description",componentId:"t1wy89-10"})([""]),U=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{direction:"row"}))}).withConfig({displayName:"PanelChapter__LayersFocusWrap",componentId:"t1wy89-11"})([""]),W=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{fill:"horizontal"}))}).withConfig({displayName:"PanelChapter__LayerFocus",componentId:"t1wy89-12"})([""]),$=Object(u.default)(function(e){return a.a.createElement(m.a,E({},e,{direction:"row",align:"center",margin:{bottom:"small"}}))}).withConfig({displayName:"PanelChapter__LayerTitleWrap",componentId:"t1wy89-13"})([""]),J=Object(u.default)(b.a).withConfig({displayName:"PanelChapter__LayerTitle",componentId:"t1wy89-14"})(["font-size:15px;font-weight:bold;"]),q=Object(u.default)(function(e){return a.a.createElement(h.a,e)}).withConfig({displayName:"PanelChapter__LayerButtonInfo",componentId:"t1wy89-15"})(["margin-left:",";"],function(e){return e.stretch?"auto":0}),H=2,Y="PanelChapter",G={open:!0},K=x(k,{}),Q=x(g.a,{}),R=x(w.a,{}),V=x(v.a,{color:"white"}),X=x(O.a,{color:"white"});var Z=Object(f.b)({exploreConfig:function(e){return Object(d.i)(e)},locale:function(e){return Object(d.l)(e)},uiState:function(e){return Object(d.t)(e,{key:Y})}});var ee,te=Object(c.connect)(Z,function(e){return{onSetOpen:function(t,n){return e(Object(s.q)(Y,Object.assign({},G,n,{open:t})))},onLayerInfo:function(t){return e(Object(s.m)(t))},onSetLayers:function(t){return e(Object(s.n)(t))}}}),ne=Object(l.compose)(te)(function(e){var t=e.onPrevious,n=e.onNext,r=e.onSetLayers,i=e.locale,c=e.chapter,l=e.isFirst,f=e.isLast,u=e.uiState,d=e.onSetOpen,s=e.onLayerInfo,m=e.layersConfig,h=(u?Object.assign({},G,u):G).open,b=S(Object(o.useState)(0),2),g=b[0],w=b[1];Object(o.useEffect)(function(){c&&r(c.layers||[])},[c]);var v=c&&c.layersFocus&&m&&m.filter(function(e){return c.layersFocus.slice(0,2).indexOf(e.id)>-1});return x(y.a.Consumer,{},void 0,function(e){return x(I,{},void 0,x(L,{},void 0,x(N,{icon:h?K:Q,onClick:function(){return d(!h)}})),h&&x(A,{},void 0,("small"!==e||0===g)&&x(F,{},void 0,c&&i&&x(z,{},void 0,c.title[i]||c.title[C.DEFAULT_LOCALE]),v&&v.length>0&&x(U,{},void 0,v.map(function(e){return x(W,{},e.id,x($,{fill:1===v.length&&"horizontal"},void 0,i&&x(J,{},void 0,e["title-short"]&&(e["title-short"][i]||e["title-short"][C.DEFAULT_LOCALE]),!e["title-short"]&&(e.title[i]||e.title[C.DEFAULT_LOCALE])),x(q,{onClick:function(){return s(e["content-id"]||e.id)},icon:R,stretch:1===v.length})),x(j.a,{config:e,simple:!0,dark:!0}))}))),("small"!==e||1===g)&&x(F,{},void 0,c&&i&&x(D,{},void 0,c.description[i]||c.description[C.DEFAULT_LOCALE])),x(M,{},void 0,(!l||"small"===e&&g>0)&&x(B,{icon:V,onClick:function(){"small"===e?(g>0&&w(g-1),0===g&&(l||w(H-1),s(),t())):(s(),t())}}),x(T,{icon:X,label:a.a.createElement(p.FormattedMessage,_.next),onClick:function(){"small"===e?(g<H-1&&w(g+1),g===H-1&&(f||w(0),s(),n())):(s(),n())}}))))})}),re=n("f9c0d22799479965d07c");function oe(e,t,n,r){ee||(ee="function"===typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var o=e&&e.defaultProps,a=arguments.length-3;if(t||0===a||(t={children:void 0}),1===a)t.children=r;else if(a>1){for(var i=new Array(a),c=0;c<a;c++)i[c]=arguments[c+3];t.children=i}if(t&&o)for(var l in o)void 0===t[l]&&(t[l]=o[l]);else t||(t=o||{});return{$$typeof:ee,type:e,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}n.d(t,"ModuleStories",function(){return ce});var ae=u.default.div.withConfig({displayName:"ModuleStories__Styled",componentId:"sc-132en5s-0"})([""]),ie=oe(i.Helmet,{},void 0,oe("title",{},void 0,"Module Stories"),oe("meta",{name:"description",content:"stories"}));function ce(e){var t=e.layersConfig,n=e.storiesConfig,r=e.onPrevious,a=e.onNext,i=e.story,c=e.chapter,l=e.onSetStory,f=e.onSetChapter;if(Object(o.useEffect)(function(){i||l(0),c||f(0)}),!n)return null;var u=1===n.length?n[0]:n[i],d=u.chapters&&u.chapters.length>0&&u.chapters[c];return oe(ae,{},void 0,ie,oe(re.a,{},void 0,t&&u.chapters&&c<u.chapters.length&&oe(ne,{onPrevious:function(){return r(c)},onNext:function(){a(c,u.chapters.length)},chapter:d,isFirst:0===c,isLast:c===u.chapters.length-1,layersConfig:t.filter(function(e){return d&&d.layers&&d.layers.indexOf(e.id)>-1})})))}var le=Object(f.b)({layersConfig:function(e){return Object(d.k)(e)},storiesConfig:function(e){return Object(d.r)(e)},story:function(e){return Object(d.s)(e)},chapter:function(e){return Object(d.b)(e)}});var fe=Object(c.connect)(le,function(e){return{onNext:function(t,n){return e(Object(s.f)(Math.min(t+1,n)))},onPrevious:function(t){return e(Object(s.f)(Math.max(t-1,0)))},onSetChapter:function(t){return e(Object(s.f)(t))},onSetStory:function(t){return e(Object(s.p)(t))}}});t.default=Object(l.compose)(fe)(ce)}}]);