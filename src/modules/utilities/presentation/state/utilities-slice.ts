import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UtilitiesState {
  // Add your state properties here
  // Example:
  // data: unknown[] | null;
  // loading: boolean;
  // error: string | null;
}

const initialState: UtilitiesState = {
  // Initialize your state here
  // Example:
  // data: null,
  // loading: false,
  // error: null,
};

const utilitiesSlice = createSlice({
  name: 'utilities',
  initialState,
  reducers: {
    // Add your reducers here
    // Example:
    // setData: (state, action: PayloadAction<unknown[]>) => {
    //   state.data = action.payload;
    // },
    // setLoading: (state, action: PayloadAction<boolean>) => {
    //   state.loading = action.payload;
    // },
    // setError: (state, action: PayloadAction<string | null>) => {
    //   state.error = action.payload;
    // },
  },
});

export const { /* Add your action creators here */ } = utilitiesSlice.actions;
export default utilitiesSlice.reducer;
