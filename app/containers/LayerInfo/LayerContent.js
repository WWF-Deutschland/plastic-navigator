/**
 *
 * LayerInfo
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { Heading } from 'grommet';

import { DEFAULT_LOCALE } from 'i18n';

import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/App/saga';
import { selectContentByKey, selectLocale } from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';

import HTMLWrapper from 'components/HTMLWrapper';

import LayerReference from './LayerReference';
// import messages from './messages';

const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;

export function LayerContent({ onLoadContent, content, config, locale }) {
  useInjectSaga({ key: 'default', saga });

  useEffect(() => {
    // kick off loading of page content
    onLoadContent(config['content-id'] || config.id);
  }, [config]);

  return (
    <>
      <Title>{config.title[locale] || config.title[DEFAULT_LOCALE]}</Title>
      {content && <HTMLWrapper innerhtml={content} />}
      <LayerReference attribution={config.attribution} />
    </>
  );
}

LayerContent.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  config: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  content: (state, { config }) =>
    selectContentByKey(state, {
      contentType: 'layers',
      key: config['content-id'] || config.id,
    }),
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('layers', id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerContent);
