import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface State {
  stage: "token" | "qrcode" | "import";
}

const initialState: State = {
  stage: "token",
};

export const recievePageSlice = createSlice({
  name: "recievePageSlice",
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<State["stage"]>) => {
      state.stage = action.payload;
    },
  },
});

export const { setStage } = recievePageSlice.actions;
// select states
export const selectStage = (state: RootState) => state.recievePage.stage;

export default recievePageSlice.reducer;
