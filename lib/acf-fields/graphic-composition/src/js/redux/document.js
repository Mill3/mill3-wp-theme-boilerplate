import { createSlice } from '@reduxjs/toolkit';

export const documentSlice = createSlice({
  name: 'document',
  initialState: {
    value: [],
  },
  reducers: {
    addLayer: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      //state.value += 1;
      console.log('addLayer', state, action);
    },
    removeLayer: (state, action) => {
      //state.value -= 1;
      console.log('removeLayer', state, action);
    },
  },
})

// Action creators are generated for each case reducer function
export const { addLayer, removeLayer } = documentSlice.actions

export default documentSlice.reducer
