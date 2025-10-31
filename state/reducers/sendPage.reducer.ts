import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface State {
  stage: "token" | "chains" | "addresses";
}

const initialState: State = {
  stage: "token",
};

export const sendPageSlice = createSlice({
  name: "sendPageSlice",
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<State["stage"]>) => {
      state.stage = action.payload;
    },
    resetSendPage: () => initialState,
  },
});

export const { setStage, resetSendPage } = sendPageSlice.actions;
// select states
export const selectStage = (state: RootState) => state.sendPage.stage;

export default sendPageSlice.reducer;
