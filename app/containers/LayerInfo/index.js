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
import { Button, Box, Heading } from 'grommet';
import { Close } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';

import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/App/saga';
import {
  selectContentByKey,
  selectSingleLayerConfig,
  // selectSingleLayerCategory,
  // selectSingleLayerGroup,
  selectLocale,
} from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';

import HTMLWrapper from 'components/HTMLWrapper';

import LayerReference from './LayerReference';

const ContentWrap = styled(props => <Box pad="medium" {...props} />)``;

const Styled = styled(props => <Box {...props} background="white" />)`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: all;
  overflow-y: auto;
  z-index: 3001;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    position: absolute;
    width: 500px;
    left: auto;
  }
`;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;

// import messages from './messages';
// import commonMessages from 'messages';
export function LayerInfo({
  id,
  onLoadContent,
  content,
  onClose,
  layer,
  // layerCategory,
  // layerGroup,
  locale,
}) {
  useInjectSaga({ key: 'default', saga });
  useEffect(() => {
    // kick off loading of page content
    onLoadContent(id);
  }, [id]);

  return (
    <Styled>
      <ContentWrap>
        <Button
          onClick={() => onClose()}
          icon={<Close />}
          plain
          alignSelf="end"
        />
        <Title>
          {locale && (layer.title[locale] || layer.title[DEFAULT_LOCALE])}
        </Title>
        {content && <HTMLWrapper innerhtml={content} />}
        <LayerReference attribution={layer.attribution} />
      </ContentWrap>
    </Styled>
  );
}

LayerInfo.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  id: PropTypes.string,
  onClose: PropTypes.func,
  layer: PropTypes.object,
  // layerCategory: PropTypes.object,
  // layerGroup: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  content: (state, props) =>
    selectContentByKey(state, {
      contentType: 'layers',
      key: props.id,
    }),
  layer: (state, props) =>
    selectSingleLayerConfig(state, {
      key: props.id,
    }),
  // layerCategory: (state, props) =>
  //   selectSingleLayerCategory(state, {
  //     key: props.id,
  //   }),
  // layerGroup: (state, props) =>
  //   selectSingleLayerGroup(state, {
  //     key: props.id,
  //   }),
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

export default compose(withConnect)(LayerInfo);
