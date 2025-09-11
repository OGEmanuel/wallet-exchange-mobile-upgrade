import { configureStore } from "@reduxjs/toolkit";
import currentPageReducer from "./reducers/currentPage.reducer";
import walletConnectedReducer from "./reducers/wallet.reducer";
import activityPageReducer from "./reducers/activityPage.reducer";

export const store = configureStore({
  reducer: {
    currentPage: currentPageReducer,
    walletConnected: walletConnectedReducer,
    activityPage: activityPageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
