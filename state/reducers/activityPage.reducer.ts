import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { AppRootState } from "..";

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
    resetActivityPage: () => initialState,
  },
});

export const { setShowFilter, resetActivityPage } = activityPageSlice.actions;
// select states
export const selectShowFilter = (state: AppRootState) =>
  state.activityPage.showFilter;

export default activityPageSlice.reducer;
