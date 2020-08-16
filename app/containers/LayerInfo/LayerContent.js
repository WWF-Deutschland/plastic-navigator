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
import { Box, Text } from 'grommet';

import { DEFAULT_LOCALE } from 'i18n';

import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/App/saga';
import {
  selectContentByKey,
  selectLocale,
  selectIsActiveLayer,
} from 'containers/App/selectors';
import { loadContent, toggleLayer } from 'containers/App/actions';

import LoadingIndicator from 'components/LoadingIndicator';
import HTMLWrapper from 'components/HTMLWrapper';
import KeyFull from 'components/KeyFull';
import Checkbox from 'components/Checkbox';

import Title from './Title';
import LayerReference from './LayerReference';
// import messages from './messages';

const LayerTitle = styled(Text)`
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
`;

export function LayerContent({
  onLoadContent,
  content,
  config,
  locale,
  onToggleLayer,
  isActive,
}) {
  useInjectSaga({ key: 'default', saga });

  useEffect(() => {
    // kick off loading of page content
    onLoadContent(config['content-id'] || config.id);
  }, [config]);
  const title = config
    ? config.title[locale] || config.title[DEFAULT_LOCALE]
    : 'loading';
  return (
    <>
      <Title>{title}</Title>
      {!content && <LoadingIndicator />}
      {content && (
        <HTMLWrapper
          innerhtml={content}
          inject={[
            {
              tag: '[KEY]',
              el: (
                <Box margin={{ bottom: 'medium', top: 'medium' }}>
                  <Box
                    direction="row"
                    gap="xsmall"
                    margin={{ bottom: 'small' }}
                  >
                    <Checkbox
                      checked={isActive}
                      onToggle={() => onToggleLayer(config.id)}
                    />
                    <LayerTitle>{title}</LayerTitle>
                  </Box>
                  <KeyFull config={config} />
                </Box>
              ),
            },
          ]}
        />
      )}
      <LayerReference attribution={config.attribution} />
    </>
  );
}

LayerContent.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  onToggleLayer: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  config: PropTypes.object,
  locale: PropTypes.string,
  isActive: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  content: (state, { config }) =>
    selectContentByKey(state, {
      contentType: 'layers',
      key: config['content-id'] || config.id,
    }),
  isActive: (state, { config }) => selectIsActiveLayer(state, config.id),
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('layers', id));
    },
    onToggleLayer: id => dispatch(toggleLayer(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerContent);
