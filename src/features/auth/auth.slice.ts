import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AuthUser } from "./auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
  },
});

export const {
  setUser,
  clearAuth,
  setLoading,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;