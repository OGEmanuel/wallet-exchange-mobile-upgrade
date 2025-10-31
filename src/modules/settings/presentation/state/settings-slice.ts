import { AppRootState } from "@/state";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SettingsModel } from "../../domain/entities/models/Settings-model";
import { BankModel } from "../../domain/entities/models/bank-model";
import { ChainModel } from "../../domain/entities/models/chain-model";

interface SettingsState {
  // Add your state properties here
  // Example:
  // data: unknown[] | null;
  // loading: boolean;
  // error: string | null;
  biometricEnabled: boolean;
  activeChain: null | ChainModel;
  activeBank: BankModel | null;
  activeCurrency: string | null;
  settings: SettingsModel | null;
}

const initialState: SettingsState = {
  // Initialize your state here
  // Example:
  // data: null,
  // loading: false,
  // error: null,
  biometricEnabled: false,
  activeChain: null,
  activeBank: null,
  activeCurrency: null,
  settings: null,
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
    setActiveBank: (state, action: PayloadAction<BankModel>) => {
      state.activeBank = action.payload;
    },
    setActiveCurrency: (state, action: PayloadAction<string>) => {
      state.activeCurrency = action.payload;
    },
    setSettings: (state, action: PayloadAction<SettingsModel>) => {
      state.settings = action.payload;
    },
    resetUserSettings: (state) => {
      // Reset user-specific settings but preserve device preferences
      state.activeChain = null;
      state.activeBank = null;
      state.activeCurrency = null;
      state.settings = null;
      // Preserve biometricEnabled as it's a device preference
    },
    resetAllSettings: () => initialState,
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
  setActiveBank,
  setActiveCurrency,
  setSettings,
  resetUserSettings,
  resetAllSettings,
} = settingsSlice.actions;
export const selectBiometricEnabled = (state: AppRootState) =>
  state.settings.biometricEnabled;
export const selectSettingState = (state: AppRootState) => state.settings;
export default settingsSlice.reducer;
