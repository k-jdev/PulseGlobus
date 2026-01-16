import { configureStore } from "@reduxjs/toolkit";
import { polymarketApi } from "./services/polymarketApi";
import { gdeltApi } from "./services/gdeltApi";

export const store = configureStore({
  reducer: {
    [polymarketApi.reducerPath]: polymarketApi.reducer,
    [gdeltApi.reducerPath]: gdeltApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(polymarketApi.middleware)
      .concat(gdeltApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
