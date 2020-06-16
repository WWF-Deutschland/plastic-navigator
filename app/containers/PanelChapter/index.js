/**
 *
 * PanelChapter
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
// import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Heading, Box, Button } from 'grommet';
import { Next, Previous } from 'grommet-icons';

import {
  selectLayersConfig,
  selectExploreConfig,
  selectLocale,
} from 'containers/App/selectors';
import { setLayerInfo, setLayers } from 'containers/App/actions';

// import messages from './messages';
// import commonMessages from 'messages';

const Styled = styled(p => <Box {...p} background="black" />)`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 400px;
  height: 200px;
  pointer-events: all;
  z-index: 4000;
  display: block;
`;
//
// const TitleWrap = styled(Box)``;
const Title = styled(p => <Heading {...p} level={4} />)``;

const ButtonNext = styled(p => <Button {...p} reverse />)``;
const ButtonPrevious = styled(p => <Button {...p} />)``;

export function PanelChapter({
  onPrevious,
  onNext,
  onSetLayers,
  locale,
  chapter,
  // onLayerInfo,
  // layers,
}) {
  useEffect(() => {
    if (chapter) {
      onSetLayers(chapter.layers || []);
    }
  }, [chapter]);
  return (
    <Styled>
      {chapter && locale && <Title>{chapter.title[locale]}</Title>}
      <ButtonPrevious onClick={() => onPrevious()} icon={<Previous />} />
      <ButtonNext onClick={() => onNext()} icon={<Next />} />
    </Styled>
  );
}

PanelChapter.propTypes = {
  onSetLayers: PropTypes.func,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  // onLayerInfo: PropTypes.func,
  // layers: PropTypes.array,
  locale: PropTypes.string,
  chapter: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  layersConfig: state => selectLayersConfig(state),
  exploreConfig: state => selectExploreConfig(state),
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLayerInfo: id => dispatch(setLayerInfo(id)),
    onSetLayers: layers => dispatch(setLayers(layers)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PanelChapter);
// export default PanelChapter;
