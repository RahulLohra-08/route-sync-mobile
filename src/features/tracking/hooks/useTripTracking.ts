// src/features/tracking/hooks/useTripTracking.ts
//
// Passenger-side live tracking for ONE trip.
//
//  mount     : retain shared socket -> subscribe -> fetch REST snapshot
//  reconnect : (stompClient epoch changes) -> re-fetch snapshot and reconcile;
//              an older snapshot can never overwrite a newer live frame
//  unmount   : unsubscribe + release (socket closes after the grace period)
import { getApiErrorMessage } from "@/services/api/api-client";
import { stompClient } from "@/services/websocket/stomp-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  deriveHealth,
  fixFromLive,
  fixFromSnapshot,
  getFreshness,
} from "../tracking.logic";
import { getTrackingSnapshot, trackingDestinations } from "../tracking.service";
import { fixReceived } from "../tracking.slice";
import type {
  ConnectionState,
  LocationFix,
  LocationFreshness,
  TrackingHealth,
  TripLocationWebSocketMessage,
  TripTrackingSnapshot,
} from "../tracking.types";

/** Re-evaluate "live vs stale" without waiting for a new frame. */
const FRESHNESS_TICK_MS = 5_000;

export interface TripTracking {
  fix: LocationFix | null;
  /** Trip metadata from the REST snapshot (status, bus number, route code). */
  snapshot: TripTrackingSnapshot | null;
  connection: ConnectionState;
  freshness: LocationFreshness;
  health: TrackingHealth;
  /** First snapshot still loading. */
  loading: boolean;
  /** Human-readable problem (snapshot failure or transport error), if any. */
  error: string | null;
  /** Re-fetch the snapshot now (pull-to-refresh). */
  refresh: () => Promise<void>;
  /** Restart the socket after a fatal error. */
  reconnect: () => void;
}

export function useTripTracking(
  tripId: string | null | undefined,
  enabled = true,
): TripTracking {
  const dispatch = useAppDispatch();
  const active = enabled && !!tripId;

  const connection = useSyncExternalStore(
    stompClient.subscribeState,
    stompClient.getState,
  );
  const epoch = useSyncExternalStore(
    stompClient.subscribeState,
    stompClient.getEpoch,
  );
  const fix = useAppSelector((s) =>
    tripId ? (s.tracking.fixesByTripId[tripId] ?? null) : null,
  );

  const [snapshot, setSnapshot] = useState<TripTrackingSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [loading, setLoading] = useState(active);
  const [now, setNow] = useState(() => Date.now());

  // Ignore responses from superseded requests (fast reconnects / trip switch).
  const requestId = useRef(0);

  const loadSnapshot = useCallback(async () => {
    if (!tripId) return;
    const myRequest = ++requestId.current;
    try {
      const data = await getTrackingSnapshot(tripId);
      if (myRequest !== requestId.current) return;
      setSnapshot(data);
      setSnapshotError(null);
      const snapshotFix = fixFromSnapshot(data, Date.now());
      if (snapshotFix) dispatch(fixReceived(snapshotFix)); // reducer drops it if older
    } catch (error) {
      if (myRequest !== requestId.current) return;
      setSnapshotError(getApiErrorMessage(error, "Could not load this trip."));
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  }, [tripId, dispatch]);

  // 1) Socket + live subscription.
  useEffect(() => {
    if (!active || !tripId) return;
    const release = stompClient.retain();
    const unsubscribe = stompClient.subscribe(
      trackingDestinations.tripLocation(tripId),
      (message) => {
        try {
          const payload = JSON.parse(message.body) as TripLocationWebSocketMessage;
          if (payload.tripId !== tripId) return;
          dispatch(fixReceived(fixFromLive(payload, Date.now())));
        } catch {
          // Malformed frame: drop it, keep the last good fix.
        }
      },
    );
    return () => {
      unsubscribe();
      release();
    };
  }, [active, tripId, dispatch]);

  // 2) Snapshot on mount AND after every (re)connect. `epoch` bumps only after
  //    the subscription is re-established, so there is no blind gap.
  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }
    setLoading(snapshot === null);
    void loadSnapshot();
    // `snapshot` intentionally omitted: it must not retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, loadSnapshot, epoch]);

  // 3) Freshness clock.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), FRESHNESS_TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  const freshness = getFreshness(fix, now);
  const health = deriveHealth({
    connection,
    freshness,
    tripStatus: snapshot?.status,
  });

  const transportError =
    connection === "error" ? stompClient.getLastError() : null;

  return {
    fix,
    snapshot,
    connection,
    freshness,
    health,
    loading,
    error: transportError ?? snapshotError,
    refresh: loadSnapshot,
    reconnect: () => stompClient.retry(),
  };
}
