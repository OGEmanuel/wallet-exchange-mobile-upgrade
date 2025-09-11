import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

interface State {
  showFilter: boolean;
}

const initialState: State = {
  showFilter: false,
};

export const activityPageSlice = createSlice({
  name: "activityPageSlice",
  initialState,
  reducers: {
    setShowFilter: (state, action: PayloadAction<boolean>) => {
      state.showFilter = action.payload;
    },
  },
});

export const { setShowFilter } = activityPageSlice.actions;
// select states
export const selectShowFilter = (state: RootState) =>
  state.activityPage.showFilter;

export default activityPageSlice.reducer;
