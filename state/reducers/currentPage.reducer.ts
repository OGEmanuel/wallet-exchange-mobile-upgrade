import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { AppRootState } from "..";

interface State {
  currentPage: number;
  walletName: string;
  seedPhrase: string;
  keyName: string;
  privateKey: string;
}

const initialState: State = {
  currentPage: 1,
  walletName: "",
  seedPhrase: "",
  keyName: "",
  privateKey: "",
};

export const currentPageSlice = createSlice({
  name: "currentPageSlice",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetCurrentPage: (state) => {
      state.walletName = "";
      state.seedPhrase = "";
      state.keyName = "";
      state.privateKey = "";
      state.currentPage = 1;
    },
    setWalletName: (state, action: PayloadAction<string>) => {
      state.walletName = action.payload;
    },
    setSeedPhrase: (state, action: PayloadAction<string>) => {
      // Ensure seed phrase is always a string, never null or undefined
      state.seedPhrase = action.payload || "";
    },
    setKeyName: (state, action: PayloadAction<string>) => {
      state.keyName = action.payload;
    },
    setPrivateKey: (state, action: PayloadAction<string>) => {
      state.privateKey = action.payload;
    },
  },
});

export const { setCurrentPage, resetCurrentPage, setWalletName, setSeedPhrase, setKeyName, setPrivateKey } =
  currentPageSlice.actions;

export const selectWalletName = (state: AppRootState) =>
  state.currentPage.walletName;

export const selectSeedPhrase = (state: AppRootState) =>
  state.currentPage.seedPhrase;

export const selectKeyName = (state: AppRootState) =>
  state.currentPage.keyName;

export const selectPrivateKey = (state: AppRootState) =>
  state.currentPage.privateKey;

export default currentPageSlice.reducer;

export const selectCurrentPage = (state: AppRootState) =>
  state.currentPage.currentPage;
