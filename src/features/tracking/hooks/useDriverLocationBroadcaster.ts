import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { stompClient } from "@/services/websocket/stomp-client";
import { driverApi } from "@/features/driver/driver.api";

import { trackingDestinations } from "../tracking.service";

interface UseDriverLocationBroadcasterOptions {
  tripId: string | null | undefined;
  /** Only broadcast while true - the caller should pass
   *  `trip.status === 'IN_PROGRESS'` (the backend also enforces this
   *  server-side and will reject updates otherwise). */
  enabled: boolean;
}

interface UseDriverLocationBroadcasterResult {
  isBroadcasting: boolean;
  lastSentAt: Date | null;
  lastTransport: "ws" | "rest" | null;
  lastError: string | null;
}

const LOCATION_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000, // at most every 5s
  distanceInterval: 10, // or every 10 meters, whichever comes first
};

/**
 * Streams the driver's device GPS to the backend for the given trip.
 *
 * TRANSPORT: prefers the WebSocket ( /app/trips/{tripId}/location ,
 * handled by DriverLocationSocketController) for lower latency, and
 * transparently falls back to the existing REST PATCH endpoint
 * (DriverLocationController) whenever the socket is not currently
 * connected - e.g. mid-reconnect after a tunnel. This means GPS
 * points are never dropped just because the socket blinked; at worst
 * they go out one HTTP call slower.
 *
 * The backend validates and persists identically either way (both
 * paths call TripLocationService.updateLocation), and broadcasts the
 * result to every subscribed passenger on /topic/trips/{tripId}/location.
 */
export function useDriverLocationBroadcaster({
  tripId,
  enabled,
}: UseDriverLocationBroadcasterOptions): UseDriverLocationBroadcasterResult {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [lastTransport, setLastTransport] = useState<"ws" | "rest" | null>(
    null
  );
  const [lastError, setLastError] = useState<string | null>(null);

  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );

  useEffect(() => {
    if (!enabled || !tripId) {
      setIsBroadcasting(false);
      return;
    }

    let cancelled = false;

    // Keep the driver's own socket connected too, so the WS fast path
    // is available. This is best-effort: if it fails, sendLocation()
    // below simply falls back to REST for every point.
    stompClient.connect().catch((connectError: Error) => {
      console.warn(
        "[DriverBroadcaster] WS connect failed, will use REST only:",
        connectError.message
      );
    });

    const sendLocation = async (location: Location.LocationObject) => {
      const payload = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed:
          location.coords.speed != null && location.coords.speed >= 0
            ? location.coords.speed
            : null,
        heading:
          location.coords.heading != null && location.coords.heading >= 0
            ? location.coords.heading
            : null,
        accuracy: location.coords.accuracy ?? null,
      };

      const sentOverSocket = stompClient.publish(
        trackingDestinations.driverLocationPush(tripId),
        payload
      );

      if (sentOverSocket) {
        if (!cancelled) {
          setLastSentAt(new Date());
          setLastTransport("ws");
          setLastError(null);
        }
        return;
      }

      try {
        await driverApi.updateLocation(tripId, payload);

        if (!cancelled) {
          setLastSentAt(new Date());
          setLastTransport("rest");
          setLastError(null);
        }
      } catch (restError) {
        if (!cancelled) {
          const message =
            restError instanceof Error
              ? restError.message
              : "Failed to send location";

          setLastError(message);
        }

        console.error("[DriverBroadcaster] Failed to send GPS point:", restError);
      }
    };

    const start = async () => {
      const { status } =
        await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!cancelled) {
          setLastError(
            "Location permission is required to broadcast your position."
          );
        }
        return;
      }

      const subscription = await Location.watchPositionAsync(
        LOCATION_OPTIONS,
        (location) => {
          sendLocation(location);
        }
      );

      if (cancelled) {
        subscription.remove();
        return;
      }

      watchSubscriptionRef.current = subscription;
      setIsBroadcasting(true);
    };

    start();

    return () => {
      cancelled = true;
      watchSubscriptionRef.current?.remove();
      watchSubscriptionRef.current = null;
      setIsBroadcasting(false);
    };
  }, [tripId, enabled]);

  return { isBroadcasting, lastSentAt, lastTransport, lastError };
}
