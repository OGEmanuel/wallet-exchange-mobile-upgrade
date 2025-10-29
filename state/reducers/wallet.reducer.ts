import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { UserModel } from "@zap/blockchain-sdk";
import { AppRootState } from "..";

interface State {
  walletConnected: boolean;
  walletUser: UserModel | null;
}

const initialState: State = {
  walletConnected: false,
  walletUser: null,
};

export const walletConnectedSlice = createSlice({
  name: "currentPageSlice",
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<boolean>) => {
      state.walletConnected = action.payload;
    },
    setWalletUser: (state, action: PayloadAction<UserModel>) => {
      state.walletUser = action.payload;
    },
  },
});

export const { setWalletConnected, setWalletUser } =
  walletConnectedSlice.actions;

export const selectWalletConnected = (state: AppRootState) =>
  state.walletConnected.walletConnected;
export const selectWalletUser = (state: AppRootState) =>
  state.walletConnected.walletUser;
export default walletConnectedSlice.reducer;
