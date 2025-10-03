import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyModel } from '../../domain/entities/models/currency-model';
import { SupportedCurrencyModel } from '../../domain/entities/models/supported-currency-model';
import { VerifiedCountryModel } from '../../domain/entities/models/verified-country-model';

interface UtilitiesState {
  currencies: CurrencyModel[] | null;
  supportedCurrencies: SupportedCurrencyModel[] | null;
  verifiedCountries: VerifiedCountryModel[] | null;
}

const initialState: UtilitiesState = {
  currencies: null,
  supportedCurrencies: null,
  verifiedCountries: null,
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
    setVerifiedCountries: (state, action: PayloadAction<VerifiedCountryModel[] | null>) => {
      state.verifiedCountries = action.payload;
    },
  },
});

export const utilitiesActions = utilitiesSlice.actions;
export default utilitiesSlice.reducer; 
