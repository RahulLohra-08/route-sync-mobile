import { useEffect, useRef, useState, } from "react";

import * as Location from "expo-location";

import { stompClient } from "@/services/websocket/stomp-client";

import { driverApi } from "@/features/driver/driver.api";

import { trackingDestinations } from "../tracking.service";

interface UseDriverLocationBroadcasterOptions {
  tripId: string | null | undefined;
  enabled: boolean;
}

interface UseDriverLocationBroadcasterResult {

  isBroadcasting: boolean;

  lastSentAt: Date | null;

  lastTransport: "ws" | "rest" | null;

  lastError: string | null;

  lastLocation: Location.LocationObject | null;
}

const LOCATION_OPTIONS: Location.LocationOptions = {

  accuracy: Location.Accuracy.High,

  timeInterval: 5000,

  distanceInterval: 10,
};

export function useDriverLocationBroadcaster({ tripId, enabled } : UseDriverLocationBroadcasterOptions):UseDriverLocationBroadcasterResult {

  const [ isBroadcasting, setIsBroadcasting] = useState(false);

  const [ lastSentAt, setLastSentAt] = useState<Date | null>(null);

  const [lastTransport,setLastTransport] = useState<"ws" | "rest" | null>(null);

  const [ lastError, setLastError] = useState<string | null>(null);

  const [ lastLocation, setLastLocation] = useState<Location.LocationObject | null>( null );

  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /*
   * Henglish:
   *
   * Agar previous REST request abhi pending hai,
   * next GPS point ke saath parallel requests ka flood
   * nahi karenge.
   */
  const sendingRef = useRef(false);

  useEffect(() => {

    if (!enabled || !tripId) {

      setIsBroadcasting(false);

      return;
    }

    let cancelled = false;

    /*
     * WebSocket ko background mein connect/reconnect
     * hone denge.
     */
    stompClient
      .connect()
      .catch(error => {

        console.warn(
          "[DriverGPS] WebSocket unavailable:",
          error.message
        );

        /*
         * REST fallback automatically available rahega.
         */
      });

    const unsubscribeError =
      stompClient.onError(
        message => {

          if (!cancelled) {

            setLastError(message);
          }
        }
      );

    const sendLocation = async (location: Location.LocationObject) => {

        if (cancelled) {
          return;
        }

        /*
         * Previous request pending hai to
         * GPS queue build nahi karenge.
         */
        if (sendingRef.current) {
          return;
        }

        sendingRef.current = true;

        setLastLocation(location);

        const payload = {

          latitude:
            location.coords.latitude,

          longitude:
            location.coords.longitude,

          speed:
            location.coords.speed != null
            && location.coords.speed >= 0
              ? location.coords.speed
              : null,

          heading:
            location.coords.heading != null
            && location.coords.heading >= 0
              ? location.coords.heading
              : null,

          accuracy:
            location.coords.accuracy ?? null,
        };

        try {

          /*
           * First preference:
           *
           * Existing WebSocket connection.
           */
          const sentOverWebSocket =
            stompClient.publish(
              trackingDestinations
                .driverLocationPush(
                  tripId
                ),
              payload
            );

          if (sentOverWebSocket) {

            if (!cancelled) {

              setLastSentAt(
                new Date()
              );

              setLastTransport(
                "ws"
              );

              setLastError(null);
            }

            return;
          }

          /*
           * Henglish:
           *
           * Socket currently connected nahi hai.
           * REST reliable fallback use karenge.
           */
          await driverApi.updateLocation(
            tripId,
            payload
          );

          if (!cancelled) {

            setLastSentAt(
              new Date()
            );

            setLastTransport(
              "rest"
            );

            setLastError(null);
          }

        } catch (error) {

          const message =
            error instanceof Error
              ? error.message
              : "Failed to send GPS location";

          if (!cancelled) {

            setLastError(
              message
            );
          }

          console.error(
            "[DriverGPS] Location send failed:",
            error
          );

        } finally {

          sendingRef.current = false;
        }
      };

    const start = async () => {

        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== "granted") {

          if (!cancelled) {

            setLastError(
              "Location permission is required."
            );
          }

          return;
        }

        const subscription =
          await Location
            .watchPositionAsync(
              LOCATION_OPTIONS,
              location => {

                sendLocation(
                  location
                );
              }
            );

        if (cancelled) {

          subscription.remove();

          return;
        }

        watchSubscriptionRef.current =
          subscription;

        setIsBroadcasting(
          true
        );
      };

    start().catch(error => {

      if (!cancelled) {

        setLastError(
          error instanceof Error
            ? error.message
            : "Unable to start GPS tracking"
        );
      }
    });

    return () => {

      cancelled = true;

      unsubscribeError();

      watchSubscriptionRef
        .current
        ?.remove();

      watchSubscriptionRef.current =
        null;

      setIsBroadcasting(false);
    };

  }, [tripId, enabled]);

  return {

    isBroadcasting,

    lastSentAt,

    lastTransport,

    lastError,

    lastLocation,
  };
}