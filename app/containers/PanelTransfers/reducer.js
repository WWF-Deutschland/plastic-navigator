/*
 *
 * Map reducer
 *
 */
import produce from 'immer';
import {
  DATA_REQUESTED,
  DATA_LOAD_SUCCESS,
  DATA_LOAD_ERROR,
} from './constants';

export const initialState = {
  analysis: 'gyres',
  data: {},
  dataRequested: {},
  dataReady: {},
};

/* eslint-disable default-case, no-param-reassign */
const transferReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case DATA_REQUESTED:
        /* eslint-disable no-console */
        console.log('Request layer:', action.key);
        draft.dataRequested[action.key] = action.time;
        break;
      case DATA_LOAD_SUCCESS:
        /* eslint-disable no-console */
        console.log('Success loading layer:', action.key);
        draft.data[action.key] = action.data;
        draft.dataReady[action.key] = action.time;
        break;
      case DATA_LOAD_ERROR:
        /* eslint-disable no-console */
        console.log('Error loading transfer data... giving up!', action.key);
        draft.dataRequested[action.key] = action.time;
        break;
    }
  });

export default transferReducer;
