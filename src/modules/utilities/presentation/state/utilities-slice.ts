import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyModel } from '../../domain/entities/models/currency-model';
import { SupportedCurrencyModel } from '../../domain/entities/models/supported-currency-model';

interface UtilitiesState {
  currencies: CurrencyModel[] | null;
  supportedCurrencies: SupportedCurrencyModel[] | null;
}

const initialState: UtilitiesState = {
  currencies: null,
  supportedCurrencies: null,
};

const utilitiesSlice = createSlice({
  name: 'utilities',
  initialState,
  reducers: {
    setCurrencies: (state, action: PayloadAction<CurrencyModel[] | null>) => {
      state.currencies = action.payload;
    },
    setSupportedCurrencies: (state, action: PayloadAction<SupportedCurrencyModel[] | null>) => {
      state.supportedCurrencies = action.payload;
    },
  },
});

export const utilitiesActions = utilitiesSlice.actions;
export default utilitiesSlice.reducer; 
