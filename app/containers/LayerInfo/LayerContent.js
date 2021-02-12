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
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadContent, toggleLayer } from 'containers/App/actions';
import { loadLayer } from 'containers/Map/actions';

import LoadingIndicator from 'components/LoadingIndicator';
import HTMLWrapper from 'components/HTMLWrapper';
import KeyFull from 'components/KeyFull';
import Checkbox from 'components/Checkbox';
import { ExploreS as Layer } from 'components/Icons';

import Title from './Title';
import LayerReference from './LayerReference';
// import messages from './messages';

const LayerTitle = styled(Text)`
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
`;

const TitleWrap = styled(p => (
  <Box margin={{ top: 'small' }} {...p} align="center" flex={false} />
))``;

export function LayerContent({
  onLoadContent,
  content,
  config,
  locale,
  onToggleLayer,
  isActive,
  layerData,
  onLoadLayer,
  inject = [],
}) {
  useInjectSaga({ key: 'default', saga });

  useEffect(() => {
    // kick off loading of page content
    onLoadContent(config['content-id'] || config.id);
  }, [config]);
  useEffect(() => {
    // kick off loading of page content
    if (config.render && config.render.type === 'scaledCircle') {
      onLoadLayer(config.id, config);
    }
  }, [layerData]);
  const title = config
    ? config.title[locale] || config.title[DEFAULT_LOCALE]
    : 'loading';

  // prettier-ignore
  return (
    <>
      <TitleWrap>
        <Layer />
        <Title>{title}</Title>
      </TitleWrap>
      {!content && <LoadingIndicator />}
      {content && (
        <HTMLWrapper
          innerhtml={content}
          inject={[
            {
              tag: '[KEY]',
              el: (
                <Box margin={{ bottom: 'large', top: 'medium' }} gap="small">
                  <Checkbox
                    checked={isActive}
                    onToggle={() => onToggleLayer(config.id)}
                    styledLabel={
                      <LayerTitle>{title}</LayerTitle>
                    }
                  />
                  <Box margin={{ left: '30px', }} flex={false}>
                    <KeyFull
                      config={config}
                      layerData={layerData && layerData.data}
                    />
                  </Box>
                </Box>
              ),
            },
            ...inject || [],
          ]}
        />
      )}
      {config.attribution && <LayerReference attribution={config.attribution} />}
    </>
  );
}

LayerContent.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  onToggleLayer: PropTypes.func.isRequired,
  onLoadLayer: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  config: PropTypes.object,
  layerData: PropTypes.object,
  inject: PropTypes.array,
  locale: PropTypes.string,
  isActive: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  content: (state, { config }) =>
    selectContentByKey(state, {
      contentType: 'layers',
      key: config['content-id'] || config.id,
    }),
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
  isActive: (state, { config }) => selectIsActiveLayer(state, config.id),
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('layers', id));
    },
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onToggleLayer: id => dispatch(toggleLayer(id)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerContent);
