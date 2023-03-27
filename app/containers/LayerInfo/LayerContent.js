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

import { useInjectSaga } from 'utils/injectSaga';
import qe from 'utils/quasi-equals';

import saga from 'containers/App/saga';
import {
  selectContentByKey,
  selectIsActiveLayer,
} from 'containers/App/selectors';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadContent, toggleLayer } from 'containers/App/actions';
import { loadLayer } from 'containers/Map/actions';

import LoadingIndicator from 'components/LoadingIndicator';
import HTMLWrapper from 'components/HTMLWrapper';
import KeyFull from 'components/KeyFull';
import Checkbox from 'components/Checkbox';

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
  onToggleLayer,
  isActive,
  layerData,
  onLoadLayer,
  inject = [],
  title,
  header,
  fullLayerId,
}) {
  useInjectSaga({ key: 'default', saga });

  useEffect(() => {
    // kick off loading of page content
    if (fullLayerId && config.indicators) {
      const [, indiId] = fullLayerId.split('_');
      const indicatorConfig = config.indicators.indicators.find(l =>
        qe(l.id, indiId),
      );
      onLoadContent(
        indicatorConfig['content-id'] || config['content-id'] || config.id,
      );
    } else {
      onLoadContent(config['content-id'] || config.id);
    }
  }, [config, fullLayerId]);
  useEffect(() => {
    // kick off loading of page content
    if (config.render && config.render.type === 'scaledCircle') {
      onLoadLayer(config.id, config);
    }
  }, [layerData]);

  // prettier-ignore
  return (
    <>
      {header && (<>{header}</>)}
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
  isActive: PropTypes.bool,
  title: PropTypes.string,
  fullLayerId: PropTypes.string,
  header: PropTypes.node,
};

const mapStateToProps = createStructuredSelector({
  content: (state, { config, fullLayerId }) => {
    if (fullLayerId && config.indicators) {
      const [, indId] = fullLayerId.split('_');
      const indicatorConfig = config.indicators.indicators.find(l =>
        qe(l.id, indId),
      );
      return selectContentByKey(state, {
        contentType: 'layers',
        key: indicatorConfig['content-id'] || config['content-id'] || config.id,
      });
    }
    return selectContentByKey(state, {
      contentType: 'layers',
      key: config['content-id'] || config.id,
    });
  },
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
  isActive: (state, { config }) => selectIsActiveLayer(state, config.id),
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
