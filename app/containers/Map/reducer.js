/*
 *
 * Map reducer
 *
 */
import produce from 'immer';
import {
  LAYER_REQUESTED,
  LAYER_LOAD_SUCCESS,
  LAYER_LOAD_ERROR,
} from './constants';

export const initialState = {
  layers: {},
  layersRequested: {},
  layersReady: {},
};

/* eslint-disable default-case, no-param-reassign */
const mapReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LAYER_REQUESTED:
        draft.layersRequested[action.key] = action.time;
        break;
      case LAYER_LOAD_SUCCESS:
        draft.layers[action.key] = {
          config: action.config,
          data: action.data,
        };
        draft.layersReady[action.key] = action.time;
        break;
      case LAYER_LOAD_ERROR:
        console.log('Error loading layer data... giving up!', action.key);
        draft.layersRequested[action.key] = action.time;
        break;
    }
  });

export default mapReducer;
