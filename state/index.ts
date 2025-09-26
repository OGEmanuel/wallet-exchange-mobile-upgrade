import { configureStore } from "@reduxjs/toolkit";
import activityPageReducer from "./reducers/activityPage.reducer";
import currentPageReducer from "./reducers/currentPage.reducer";
import kycReducer from "./reducers/kyc-reducer";
import walletConnectedReducer from "./reducers/wallet.reducer";

export const store = configureStore({
  reducer: {
    kyc: kycReducer,
    currentPage: currentPageReducer,
    walletConnected: walletConnectedReducer,
    activityPage: activityPageReducer,
  },
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
