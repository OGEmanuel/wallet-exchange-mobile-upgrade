import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

interface State {
  currentPage: number;
  walletName: string;
}

const initialState: State = {
  currentPage: 1,
  walletName: "",
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
      state.currentPage = 1;
    },
    setWalletName: (state, action: PayloadAction<string>) => {
      state.walletName = action.payload;
    },
  },
});

export const { setCurrentPage, resetCurrentPage, setWalletName } =
  currentPageSlice.actions;

export const selectWalletName = (state: RootState) =>
  state.currentPage.walletName;

export default currentPageSlice.reducer;

export const selectCurrentPage = (state: RootState) =>
  state.currentPage.currentPage;
