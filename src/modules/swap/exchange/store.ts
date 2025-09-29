import { configureStore } from "@reduxjs/toolkit"
import swapReducer from "./slices/swap.slice"

export const exchangeStore = configureStore({
  reducer: {
    swap: swapReducer,
  },
})

export type ExchangeRootState = ReturnType<typeof exchangeStore.getState>
export type ExchangeDispatch = typeof exchangeStore.dispatch
