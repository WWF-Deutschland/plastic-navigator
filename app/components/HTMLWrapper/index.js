import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { navigate } from 'containers/App/actions';

/**
 * Wrap HTML text:
 * - sets global class to allow specifically targeting html markup
 *
 * @return {Component} HTMLWrapper
 */

// <div
// className="rle-html"
// dangerouslySetInnerHTML={{ __html: setLinkTarget(innerhtml) }}
// />
const HTMLWrapper = ({ innerhtml, onNavigate, inject }) => (
  <div className="app-html">
    {ReactHtmlParser(innerhtml, {
      transform: (node, index) => {
        if (node.name === 'a' && node.attribs && node.attribs.href) {
          if (node.attribs.href.indexOf('/explore') === 0) {
            return (
              <a
                key={index}
                href={node.attribs.href}
                onClick={e => {
                  e.preventDefault();
                  onNavigate(node.attribs.href.replace('/explore', 'explore'));
                }}
              >
                {node.children[0].data}
              </a>
            );
          }
          return (
            <a key={index} href={node.attribs.href} target="_blank">
              {node.children[0].data}
            </a>
          );
        }
        if (
          inject &&
          inject.length > 0 &&
          node.name === 'p' &&
          node.children &&
          node.children.length === 1 &&
          node.children[0]
        ) {
          const inj = inject.find(({ tag }) => tag === node.children[0].data);
          return inj ? <span key={index}>{inj.el}</span> : undefined;
        }
        return undefined;
      },
    })}
  </div>
);

HTMLWrapper.propTypes = {
  /* the inner HTML text */
  innerhtml: PropTypes.string.isRequired,
  onNavigate: PropTypes.func,
  inject: PropTypes.array,
};

function mapDispatchToProps(dispatch) {
  return {
    onNavigate: location => dispatch(navigate(location)),
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(HTMLWrapper);
