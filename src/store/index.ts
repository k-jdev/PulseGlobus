import { configureStore } from "@reduxjs/toolkit";

import { gdeltApi } from "./services/gdeltApi";
import { polymarketApi } from "./services/polymarketApi";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [polymarketApi.reducerPath]: polymarketApi.reducer,
    [gdeltApi.reducerPath]: gdeltApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      polymarketApi.middleware,
      gdeltApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
