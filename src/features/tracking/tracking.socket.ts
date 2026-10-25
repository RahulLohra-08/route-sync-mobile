import {
    Client,
    IMessage,
    StompSubscription,
} from "@stomp/stompjs";

import { getAccessToken } from "@/services/auth/token.service";

import {
    setConnectionStatus,
    setTrackingError,
    upsertLocation,
} from "./tracking.slice";

import type {
    TripLocationWebSocketMessage
} from "./tracking.types";

import { trackingDestinations } from "./tracking.service";

import type { AppDispatch } from "@/store";

/**
 * RouteSync ke live tracking ke liye centralized STOMP manager.
 *
 * Henglish:
 *
 * Is class ka kaam:
 *
 * 1. STOMP connection manage karna
 * 2. JWT ke saath CONNECT karna
 * 3. Trip location topic subscribe karna
 * 4. Backend se GPS message receive karna
 * 5. Redux mein latest location save karna
 *
 * Important:
 *
 * Har screen apna alag WebSocket connection nahi banayegi.
 * Ek centralized connection use hoga.
 */
class TrackingSocketService {

  private client: Client | null = null;

  /**
   * Trip ID -> STOMP subscription
   *
   * Henglish:
   *
   * Is map se hum track kar sakte hain ki kaunsa trip
   * already subscribed hai.
   */
  private subscriptions =
    new Map<string, StompSubscription>();

  /**
   * Redux dispatch ko service ke andar store kar rahe hain.
   */
  private dispatch: AppDispatch | null = null;

  /**
   * Current connection promise.
   *
   * Henglish:
   *
   * Agar ek hi time par multiple screens connect() call karein,
   * to multiple WebSocket connections nahi banenge.
   */
  private connectionPromise: Promise<void> | null = null;

  /**
   * Redux dispatch initialize karta hai.
   */
  initialize(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  // =========================================================
  // CONNECT
  // =========================================================

  async connect(): Promise<void> {

    /*
     * Agar already connected hain to kuch nahi karna.
     */
    if (this.client?.connected) {
      this.dispatch?.(
        setConnectionStatus("connected")
      );

      return;
    }

    /*
     * Agar connection already process mein hai,
     * same promise return karenge.
     */
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise(
      async (resolve, reject) => {

        try {

          this.dispatch?.(
            setConnectionStatus("connecting")
          );

          /*
           * JWT access token retrieve karenge.
           *
           * Henglish:
           *
           * Authentication already existing hai.
           * Hum wahi stored JWT reuse kar rahe hain.
           */
          const token =
            await getAccessToken();

          if (!token) {

            const message =
              "Authentication token not found";

            this.dispatch?.(
              setTrackingError(message)
            );

            this.dispatch?.(
              setConnectionStatus("error")
            );

            reject(
              new Error(message)
            );

            return;
          }

          /*
           * Existing Expo environment se WebSocket URL.
           *
           * Example:
           *
           * EXPO_PUBLIC_WS_URL=ws://10.242.108.202:5000/ws
           */
          const wsUrl =
            process.env.EXPO_PUBLIC_WS_URL;

          if (!wsUrl) {

            const message =
              "EXPO_PUBLIC_WS_URL is not configured";

            this.dispatch?.(
              setTrackingError(message)
            );

            this.dispatch?.(
              setConnectionStatus("error")
            );

            reject(
              new Error(message)
            );

            return;
          }

          /*
           * STOMP client create kar rahe hain.
           */
          const client = new Client({

            brokerURL: wsUrl,

            /*
             * Backend heartbeat ke saath match.
             */
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            /*
             * Connection tootne par automatically reconnect.
             *
             * Henglish:
             *
             * Driver/passenger ke network mein temporary issue aaye
             * to manually app restart karne ki zaroorat nahi.
             */
            reconnectDelay: 5000,

            /*
             * STOMP CONNECT headers.
             *
             * Backend ka StompAuthChannelInterceptor
             * Authorization header read karega.
             */
            connectHeaders: {
              Authorization: `Bearer ${token}`,
            },

            /*
             * Debug development ke time useful hai.
             *
             * Production mein excessive logs avoid karenge.
             */
            debug: (message) => {
              if (__DEV__) {
                console.log("[STOMP]", message);
              }
            },

            // =================================================
            // CONNECTED
            // =================================================

            onConnect: () => {

              console.log(
                "[TRACKING] STOMP connected"
              );

              this.dispatch?.(
                setConnectionStatus("connected")
              );

              /*
               * Existing pending connect() resolve.
               */
              resolve();
            },

            // =================================================
            // STOMP ERROR
            // =================================================

            onStompError: (frame) => {

              console.error(
                "[TRACKING] STOMP broker error:",
                frame.headers["message"],
                frame.body
              );

              const message =
                frame.headers["message"] ||
                "STOMP broker error";

              this.dispatch?.(
                setTrackingError(message)
              );

              this.dispatch?.(
                setConnectionStatus("error")
              );

              /*
               * Agar initial connection fail hua hai
               * to promise reject karenge.
               */
              reject(
                new Error(message)
              );
            },

            // =================================================
            // WEBSOCKET ERROR
            // =================================================

            onWebSocketError: (event) => {

              console.error(
                "[TRACKING] WebSocket error:",
                event
              );

              this.dispatch?.(
                setTrackingError(
                  "WebSocket connection error"
                )
              );

              this.dispatch?.(
                setConnectionStatus("error")
              );
            },

            // =================================================
            // WEBSOCKET CLOSE
            // =================================================

            onWebSocketClose: () => {

              console.log(
                "[TRACKING] WebSocket closed"
              );

              this.dispatch?.(
                setConnectionStatus("disconnected")
              );
            },
          });

          this.client = client;

          /*
           * STOMP connection start.
           */
          client.activate();

        } catch (error) {

          const message =
            error instanceof Error
              ? error.message
              : "Could not connect to tracking server";

          this.dispatch?.(
            setTrackingError(message)
          );

          this.dispatch?.(
            setConnectionStatus("error")
          );

          reject(error);

        } finally {

          /*
           * Connection promise ko reset karenge.
           */
          this.connectionPromise = null;
        }
      }
    );

    return this.connectionPromise;
  }

  // =========================================================
  // SUBSCRIBE TO TRIP
  // =========================================================

  async subscribeToTrip(
    tripId: string
  ): Promise<void> {

    /*
     * Pehle STOMP connection ensure karo.
     */
    await this.connect();

    if (!this.client?.connected) {

      throw new Error(
        "STOMP client is not connected"
      );
    }

    /*
     * Same trip already subscribed hai to duplicate
     * subscription create nahi karenge.
     */
    if (this.subscriptions.has(tripId)) {

      console.log(
        `[TRACKING] Already subscribed to trip ${tripId}`
      );

      return;
    }

    const destination = trackingDestinations.tripLocation(tripId);

    console.log("[TRACKING] Subscribing:",destination);

    const subscription =
      this.client.subscribe(
        destination,
        (message: IMessage) => {

          this.handleLocationMessage(
            message
          );
        }
      );

    this.subscriptions.set(
      tripId,
      subscription
    );
  }

  // =========================================================
  // HANDLE LIVE LOCATION
  // =========================================================

  private handleLocationMessage(
    message: IMessage
  ) {

    try {

      /*
       * Backend JSON string ko TypeScript object mein convert.
       */
      const location =
        JSON.parse(
          message.body
        ) as TripLocationWebSocketMessage;

      console.log( "[TRACKING] Live location received:",location);

      /*
       * Basic safety check.
       *
       * Henglish:
       *
       * Backend se invalid payload aaye to Redux mein
       * corrupt data store nahi karna.
       */
      if (
        !location.tripId ||
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number"
      ) {

        console.warn(
          "[TRACKING] Invalid location payload:",
          location
        );

        return;
      }

      /*
       * Latest location Redux mein save.
       */
      this.dispatch?.(
        upsertLocation(location)
      );

    } catch (error) {

      console.error(
        "[TRACKING] Failed to parse location:",
        error
      );

      this.dispatch?.(
        setTrackingError(
          "Invalid location data received from server"
        )
      );
    }
  }

  // =========================================================
  // UNSUBSCRIBE
  // =========================================================

  unsubscribeFromTrip(
    tripId: string
  ) {

    const subscription =
      this.subscriptions.get(tripId);

    if (!subscription) {
      return;
    }

    console.log(
      `[TRACKING] Unsubscribing from trip ${tripId}`
    );

    subscription.unsubscribe();

    this.subscriptions.delete(
      tripId
    );
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  async disconnect(): Promise<void> {

    /*
     * Saari trip subscriptions remove.
     */
    for (
      const subscription
      of this.subscriptions.values()
    ) {

      subscription.unsubscribe();
    }

    this.subscriptions.clear();

    /*
     * STOMP client deactivate.
     */
    if (this.client) {

      await this.client.deactivate();

      this.client = null;
    }

    this.dispatch?.(
      setConnectionStatus("disconnected")
    );

    console.log(
      "[TRACKING] STOMP disconnected"
    );
  }

  // =========================================================
  // STATUS
  // =========================================================

  isConnected(): boolean {

    return Boolean(
      this.client?.connected
    );
  }
}

/*
 * Singleton instance.
 *
 * Henglish:
 *
 * Puri application mein ek hi tracking WebSocket manager
 * use hoga.
 */
export const trackingSocket = new TrackingSocketService();