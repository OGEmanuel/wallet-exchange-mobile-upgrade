import { AppRootState } from "@/state";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChainModel } from "../../domain/entities/models/chain-model";

interface SettingsState {
  // Add your state properties here
  // Example:
  // data: unknown[] | null;
  // loading: boolean;
  // error: string | null;
  biometricEnabled: boolean;
  activeChain: null | ChainModel;
}

const initialState: SettingsState = {
  // Initialize your state here
  // Example:
  // data: null,
  // loading: false,
  // error: null,
  biometricEnabled: false,
  activeChain: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleBiometric: (state) => {
      state.biometricEnabled = !state.biometricEnabled;
      console.log(state);
    },
    setActiveChain: (state, action: PayloadAction<ChainModel>) => {
      state.activeChain = action.payload;
    },
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

export const {
  /* Add your action creators here */ toggleBiometric,
  setActiveChain,
} = settingsSlice.actions;
export const selectBiometricEnabled = (state: AppRootState) =>
  state.settings.biometricEnabled;
export const selectSettingState = (state: AppRootState) => state.settings;
export default settingsSlice.reducer;
