import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
    TrackingConnectionStatus,
    TripLocationWebSocketMessage,
} from "./tracking.types";

interface TrackingState {
  /**
   * The trip the passenger is currently following on the "Track" tab.
   * Set when they open a bus/trip's live map, so switching tabs
   * doesn't lose which bus they were watching.
   */
  selectedTripId: string | null;

  /** Latest known location per tripId, keyed so multiple screens can
   *  read the same live data without each opening their own subscription. */
  locationsByTripId: Record<string, TripLocationWebSocketMessage>;

  connectionStatus: TrackingConnectionStatus;

  lastError: string | null;
}

const initialState: TrackingState = {
  selectedTripId: null,
  locationsByTripId: {},
  connectionStatus: "idle",
  lastError: null,
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,

  reducers: {
    setSelectedTrip(state, action: PayloadAction<string | null>) {
      state.selectedTripId = action.payload;
    },

    upsertLocation(
      state,
      action: PayloadAction<TripLocationWebSocketMessage>
    ) {
      state.locationsByTripId[action.payload.tripId] = action.payload;
    },

    setConnectionStatus(
      state,
      action: PayloadAction<TrackingConnectionStatus>
    ) {
      state.connectionStatus = action.payload;

      if (action.payload === "connected") {
        state.lastError = null;
      }
    },

    setTrackingError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },

    clearTrip(state, action: PayloadAction<string>) {
      delete state.locationsByTripId[action.payload];

      if (state.selectedTripId === action.payload) {
        state.selectedTripId = null;
      }
    },
  },
});

export const {
  setSelectedTrip,
  upsertLocation,
  setConnectionStatus,
  setTrackingError,
  clearTrip,
} = trackingSlice.actions;

export default trackingSlice.reducer;
