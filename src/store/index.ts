import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/auth.slice";
import trackingReducer from "@/features/tracking/tracking.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tracking: trackingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;