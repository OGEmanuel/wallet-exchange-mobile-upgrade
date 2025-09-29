import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { AppRootState } from "..";

interface State {
  walletConnected: boolean;
}

const initialState: State = {
  walletConnected: false,
};

export const walletConnectedSlice = createSlice({
  name: "currentPageSlice",
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<boolean>) => {
      state.walletConnected = action.payload;
    },
  },
});

export const { setWalletConnected } = walletConnectedSlice.actions;

export const selectWalletConnected = (state: AppRootState) =>
  state.walletConnected.walletConnected;

export default walletConnectedSlice.reducer;
