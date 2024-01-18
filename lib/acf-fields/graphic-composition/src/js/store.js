import { configureStore } from '@reduxjs/toolkit';

import documentReducer from './redux/document';

export default configureStore({
  reducer: {
    document: documentReducer,
  },
  preloadedState: {
    layers: []
  }
});
