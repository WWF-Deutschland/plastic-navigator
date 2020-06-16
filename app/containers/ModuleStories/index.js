/*
 * ModuleStories
 *
 *
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import {
  selectLayersConfig,
  selectStoriesConfig,
  selectUIStateByKey,
} from 'containers/App/selectors';
import { setUIState } from 'containers/App/actions';

import PanelChapter from 'containers/PanelChapter';
import ModuleWrap from 'components/ModuleWrap';

// import commonMessages from 'messages';
// import messages from './messages';

const Styled = styled.div``;

const COMPONENT_KEY = 'ModuleStories';

const DEFAULT_UI_STATE = {
  story: 0,
  chapter: 0,
};

export function ModuleStories({
  uiState,
  layersConfig,
  storiesConfig,
  onPrevious,
  onNext,
}) {
  const { story, chapter } = uiState
    ? Object.assign({}, DEFAULT_UI_STATE, uiState)
    : DEFAULT_UI_STATE;

  if (!storiesConfig) return null;

  const storyConfig =
    storiesConfig.length === 1 ? storiesConfig[0] : storiesConfig[story];
  const chapterConfig =
    storyConfig.chapters &&
    storyConfig.chapters.length > 0 &&
    storyConfig.chapters[chapter];

  return (
    <Styled>
      <Helmet>
        <title>Module Stories</title>
        <meta name="description" content="stories" />
      </Helmet>
      <ModuleWrap>
        {layersConfig && storyConfig.chapters && (
          <PanelChapter
            onPrevious={() => onPrevious(chapter)}
            onNext={() => onNext(chapter, storyConfig.chapters.length - 1)}
            chapter={chapterConfig}
            layers={layersConfig.filter(
              layer =>
                chapterConfig &&
                chapterConfig.layers &&
                chapterConfig.layers.indexOf(layer.id) > -1,
            )}
          />
        )}
      </ModuleWrap>
    </Styled>
  );
}

ModuleStories.propTypes = {
  layersConfig: PropTypes.array,
  storiesConfig: PropTypes.array,
  uiState: PropTypes.object,
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  layersConfig: state => selectLayersConfig(state),
  storiesConfig: state => selectStoriesConfig(state),
  uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
});

function mapDispatchToProps(dispatch) {
  return {
    onNext: (current, max) =>
      dispatch(
        setUIState(COMPONENT_KEY, {
          chapter: Math.min(current + 1, max),
        }),
      ),
    onPrevious: current =>
      dispatch(
        setUIState(COMPONENT_KEY, {
          chapter: Math.max(current - 1, 0),
        }),
      ),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ModuleStories);
