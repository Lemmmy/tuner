import { configureStore } from "@reduxjs/toolkit";
import { audioSlice } from "./audioSlice.ts";
import { optionsSlice } from "./optionsSlice.ts";

export const store = configureStore({
  reducer: {
    audio: audioSlice.reducer,
    options: optionsSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
