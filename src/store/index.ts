import { configureStore } from "@reduxjs/toolkit";
import { polymarketApi } from "./services/polymarketApi";

export const store = configureStore({
  reducer: {
    [polymarketApi.reducerPath]: polymarketApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(polymarketApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
