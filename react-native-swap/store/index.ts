import { configureStore } from '@reduxjs/toolkit';
import swapReducer from '../state/swapSlice';

/**
 * Example Redux store configuration
 * 
 * If you already have a Redux store in your app, add the swapReducer
 * to your existing store instead of creating a new one.
 * 
 * Example:
 * import { configureStore } from '@reduxjs/toolkit';
 * import swapReducer from './path-to/react-native-swap/state/swapSlice';
 * import yourOtherReducer from './your-other-slice';
 * 
 * export const store = configureStore({
 *   reducer: {
 *     swap: swapReducer,
 *     yourOther: yourOtherReducer,
 *   },
 * });
 */

export const store = configureStore({
  reducer: {
    swap: swapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

