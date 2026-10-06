import { useEffect, useRef, useState } from "react";

import { stompClient } from "@/services/websocket/stomp-client";
import { useAppDispatch } from "@/store/hooks";

import { getInitialTripSnapshot, trackingDestinations } from "../tracking.service";
import {
  setConnectionStatus,
  setTrackingError,
  upsertLocation,
} from "../tracking.slice";
import type {
  TrackingConnectionStatus,
  TripLocationWebSocketMessage,
} from "../tracking.types";

interface UseTripTrackingOptions {
  tripId: string | null | undefined;
  enabled?: boolean;

  /** Called on every live location update (in addition to the Redux store). */
  onLocationUpdate?: (location: TripLocationWebSocketMessage) => void;

  /** Load the trip's last known position over REST before the socket
   *  delivers its first live point. Defaults to true. */
  loadInitialSnapshot?: boolean;
}

interface UseTripTrackingResult {
  status: TrackingConnectionStatus;
  error: string | null;
}

/**
 * Subscribes a screen to a single trip's live location while it is
 * mounted. Safe to use from multiple screens/tabs at once (e.g. the
 * "Track" tab and a bus detail screen) - they share the same
 * underlying STOMP connection and each gets their own callback.
 */
export function useTripTracking({
  tripId,
  enabled = true,
  onLocationUpdate,
  loadInitialSnapshot = true,
}: UseTripTrackingOptions): UseTripTrackingResult {
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<TrackingConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callback in a ref so effect re-subscription isn't
  // triggered every time the caller passes a new inline function.
  const onLocationUpdateRef = useRef(onLocationUpdate);
  onLocationUpdateRef.current = onLocationUpdate;

  useEffect(() => {
    if (!enabled || !tripId) {
      return;
    }

    let cancelled = false;
    const destination = trackingDestinations.tripLocation(tripId);

    setStatus("connecting");
    dispatch(setConnectionStatus("connecting"));

    if (loadInitialSnapshot) {
      getInitialTripSnapshot(tripId)
        .then((snapshot: any) => {
          if (!cancelled && snapshot) {
            dispatch(upsertLocation(snapshot));
            onLocationUpdateRef.current?.(snapshot);
          }
        })
        .catch((snapshotError: any) => {
          // Non-fatal: the live subscription can still work even if
          // this initial fetch fails (e.g. trip not started yet).
          console.warn(
            "[Tracking] Could not load initial trip snapshot:",
            snapshotError
          );
        });
    }

    const unsubscribeConnection = stompClient.onConnectionChange(
      (connected) => {

          if (cancelled) return;

          if (connected) {
            setStatus("connected");
            setError(null);

            dispatch(setConnectionStatus("connected"));

            return;
          }

          setStatus("disconnected");

          dispatch(setConnectionStatus("disconnected"));
        }
      );

    const unsubscribeError = stompClient.onError((message) => {
      if (cancelled) return;

      setStatus("error");
      setError(message);
      dispatch(setTrackingError(message));
      dispatch(setConnectionStatus("error"));
    });

    stompClient
      .connect()
      .then(() => {
        if (cancelled) return;

        stompClient.subscribe(destination, (message) => {
          try {
            const location = JSON.parse(
              message.body
            ) as TripLocationWebSocketMessage;

            dispatch(upsertLocation(location));
            onLocationUpdateRef.current?.(location);
          } catch (parseError) {
            console.error(
              "[Tracking] Failed to parse location message:",
              parseError
            );
          }
        });
      })
      .catch((connectError: Error) => {
        if (cancelled) return;

        setStatus("error");
        setError(connectError.message);
        dispatch(setTrackingError(connectError.message));
        dispatch(setConnectionStatus("error"));
      });

    return () => {
      cancelled = true;
      unsubscribeConnection();
      unsubscribeError();
      stompClient.unsubscribe(destination);
      // Intentionally NOT calling stompClient.disconnect() here: other
      // screens (e.g. the Track tab) may still be using the shared
      // connection. The connection is a long-lived, app-scoped
      // resource; only this screen's subscription is torn down.
    };
  }, [tripId, enabled, loadInitialSnapshot, dispatch]);

  return { status, error };
}
