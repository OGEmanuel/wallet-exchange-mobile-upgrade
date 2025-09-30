import { marketReducer } from "@/src/modules/market/presentation/state/market-slice";
import { configureStore } from "@reduxjs/toolkit";
import swapReducer from "../src/modules/swap/presentation/state/swap-slice";
import utilitiesReducer from "../src/modules/utilities/presentation/state/utilities-slice";
import activityPageReducer from "./reducers/activityPage.reducer";
import currentPageReducer from "./reducers/currentPage.reducer";
import kycReducer from "./reducers/kyc-reducer";
import { recievePageSlice } from "./reducers/recievePage.reducer";
import { sendPageSlice } from "./reducers/sendPage.reducer";
import walletConnectedReducer from "./reducers/wallet.reducer";

export const store = configureStore({
  reducer: {
    kyc: kycReducer,
    currentPage: currentPageReducer,
    walletConnected: walletConnectedReducer,
    activityPage: activityPageReducer,
    sendPage: sendPageSlice.reducer,
    recievePage: recievePageSlice.reducer,
    utilities: utilitiesReducer,
    market: marketReducer,
    swap: swapReducer,
  },
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
