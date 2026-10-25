// src/features/tracking/tracking.slice.ts
//
// Shared tracking state: only data that MULTIPLE screens genuinely share
// (the followed trip + latest fix per trip). Connection state is NOT kept here
// anymore - stompClient is its single source of truth (read it with
// useSyncExternalStore) so there is no duplicated/out-of-sync copy.
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { shouldAcceptFix } from "./tracking.logic";
import type { LocationFix } from "./tracking.types";

interface TrackingState {
  /** Trip the passenger is following on the "Track" tab. */
  selectedTripId: string | null;
  /** Newest accepted fix per trip (one entry each - no unbounded history). */
  fixesByTripId: Record<string, LocationFix>;
}

const initialState: TrackingState = {
  selectedTripId: null,
  fixesByTripId: {},
};

/** A passenger could browse many buses in one session; keep memory bounded. */
const MAX_TRACKED_TRIPS = 12;

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    setSelectedTrip(state, action: PayloadAction<string | null>) {
      state.selectedTripId = action.payload;
    },

    /** Applies a fix only if it is not OLDER than the one we already hold. */
    fixReceived(state, action: PayloadAction<LocationFix>) {
      const fix = action.payload;
      if (!shouldAcceptFix(state.fixesByTripId[fix.tripId], fix)) return;
      state.fixesByTripId[fix.tripId] = fix;

      const ids = Object.keys(state.fixesByTripId);
      if (ids.length > MAX_TRACKED_TRIPS) {
        const oldest = ids
          .filter((id) => id !== state.selectedTripId && id !== fix.tripId)
          .sort(
            (a, b) =>
              state.fixesByTripId[a].receivedAt -
              state.fixesByTripId[b].receivedAt,
          )[0];
        if (oldest) delete state.fixesByTripId[oldest];
      }
    },

    clearTrip(state, action: PayloadAction<string>) {
      delete state.fixesByTripId[action.payload];
      if (state.selectedTripId === action.payload) state.selectedTripId = null;
    },

    /** Logout: nothing from the previous user may survive. */
    resetTracking() {
      return initialState;
    },
  },
});

export const { setSelectedTrip, fixReceived, clearTrip, resetTracking } =
  trackingSlice.actions;
export default trackingSlice.reducer;
