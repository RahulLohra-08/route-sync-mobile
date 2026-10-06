import {
  Client,
  IMessage,
  StompSubscription,
} from "@stomp/stompjs";

import { ENV } from "@/config/env";
import { getAccessToken } from "@/services/auth/token.service";

type ConnectionListener = (connected: boolean) => void;
type ErrorListener = (error: string) => void;

interface TrackedSubscription {
  callback: (message: IMessage) => void;
  liveSubscription: StompSubscription | null;
}

/**
 * RouteSync ka single shared STOMP client.
 *
 * Henglish:
 *
 * Pure app mein multiple screens ho sakte hain:
 *
 * Passenger Track
 * Passenger Bus Detail
 * Driver Trip
 *
 * Har screen ke liye separate WebSocket connection create karna
 * wasteful hai.
 *
 * Isliye ek shared connection maintain kar rahe hain.
 */
class StompClientService {

  private client: Client | null = null;

  private subscriptions = new Map<string, TrackedSubscription>();

  private connectionListeners = new Set<ConnectionListener>();

  private errorListeners = new Set<ErrorListener>();

  // =========================================================
  // CONNECT
  // =========================================================

  async connect(): Promise<void> {

    if (this.client?.connected) {
      return;
    }

    /*
     * Existing client reconnect state mein hai.
     *
     * Duplicate Client create nahi karna.
     */
    if (this.client?.active) {

      return this.waitUntilConnected();
    }

    const client = new Client({

      brokerURL: ENV.WS_URL,

      /*
       * JWT beforeConnect mein latest token se load karenge.
       *
       * Henglish:
       * Agar access token refresh ho chuka hai,
       * reconnect par old JWT use nahi hoga.
       */
      beforeConnect: async () => {

        const token = await getAccessToken();

        if (!token) {
          throw new Error("No access token available for WebSocket");
        }

        client.connectHeaders = {
          Authorization: `Bearer ${token}`,
        };
      },

      reconnectDelay: 5000,

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      /*
       * IMPORTANT:
       *
       * Expo/Hermes + Spring STOMP mein kabhi-kabhi
       * NULL terminated STOMP frame handling issue aa sakta hai.
       *
       * Ye options us problem ko handle karte hain.
       */
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      debug: (message) => {

        if (__DEV__) {

          console.log(
            "[STOMP]",
            message
          );
        }
      },

      onConnect: () => {

        console.log( "[STOMP] ✅ Connected");

        /*
         * New STOMP session create hui hai.
         *
         * Isliye old subscriptions ko re-create karna zaroori hai.
         */
        this.resubscribeAll();

        this.subscribeToPrivateQueues();

        this.connectionListeners
          .forEach(listener =>
            listener(true)
          );
      },

      onStompError: (frame) => {

        const message = frame.headers["message"] || "STOMP broker error";

        console.error(
          "[STOMP] ❌ Broker error:",
          message,
          frame.body
        );

        this.errorListeners
          .forEach(listener =>
            listener(message)
          );
      },

      onWebSocketError: (event) => {

        console.error(
          "[STOMP] ❌ WebSocket error:",
          event
        );

        this.errorListeners
          .forEach(listener =>
            listener(
              "WebSocket connection error"
            )
          );
      },

      onWebSocketClose: (event) => {

        console.log(
          "[STOMP] 🔴 Connection closed:",
          event.code,
          event.reason
        );

        this.connectionListeners
          .forEach(listener =>
            listener(false)
          );
      },

      onDisconnect: () => {

        this.connectionListeners
          .forEach(listener =>
            listener(false)
          );
      },

      onUnhandledMessage: (message) => {

        console.log(
          "[STOMP] Unhandled message:",
          message.body
        );
      },
    });

    this.client = client;

    /*
     * Wait listener activate hone ke pehle
     * connection start karenge.
     */
    const connectionPromise = this.waitUntilConnected();

    client.activate();

    return connectionPromise;
  }

  // =========================================================
  // WAIT FOR CONNECTION
  // =========================================================

  private waitUntilConnected(
    timeoutMs = 15000
  ): Promise<void> {

    if (this.client?.connected) {
      return Promise.resolve();
    }

    return new Promise(
      (resolve, reject) => {

        let completed = false;

        const cleanup = () => {

          clearTimeout(timeout);

          unsubscribeConnection();
          unsubscribeError();
        };

        const finishResolve = () => {

          if (completed) return;

          completed = true;

          cleanup();

          resolve();
        };

        const finishReject = (
          error: Error
        ) => {

          if (completed) return;

          completed = true;

          cleanup();

          reject(error);
        };

        const unsubscribeConnection =
          this.onConnectionChange(
            connected => {

              if (connected) {
                finishResolve();
              }
            }
          );

        const unsubscribeError =
          this.onError(
            message => {

              finishReject(
                new Error(message)
              );
            }
          );

        const timeout =
          setTimeout(() => {

            finishReject(
              new Error(
                "WebSocket connection timeout"
              )
            );

          }, timeoutMs);
      }
    );
  }

  // =========================================================
  // PRIVATE USER QUEUES
  // =========================================================

  private subscribeToPrivateQueues() {

    if (!this.client?.connected) {
      return;
    }

    /*
     * Driver ko successful GPS persistence acknowledgement.
     */
    this.client.subscribe(
      "/user/queue/location-ack",
      message => {

        console.log(
          "[STOMP] 📍 GPS accepted by server:",
          message.body
        );
      }
    );

    /*
     * Backend validation/business errors.
     */
    this.client.subscribe(
      "/user/queue/errors",
      message => {

        try {

          const error =
            JSON.parse(message.body);

          console.warn(
            "[STOMP] ⚠️ Server error:",
            error
          );

          this.errorListeners
            .forEach(listener =>
              listener(
                error.message
                ?? "Live tracking error"
              )
            );

        } catch {

          this.errorListeners
            .forEach(listener =>
              listener(message.body)
            );
        }
      }
    );
  }

  // =========================================================
  // RESUBSCRIBE
  // =========================================================

  private resubscribeAll() {

    this.subscriptions
      .forEach(
        (
          tracked,
          destination
        ) => {

          tracked.liveSubscription =
            this.doSubscribe(
              destination,
              tracked.callback
            );
        }
      );
  }

  // =========================================================
  // SUBSCRIBE
  // =========================================================

  private doSubscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): StompSubscription | null {

    if (!this.client?.connected) {
      return null;
    }

    console.log("[STOMP] SUBSCRIBE:",destination);

    return this.client.subscribe(
      destination,
      callback
    );
  }

  subscribe(
    destination: string,
    callback: (message: IMessage) => void
  ) {

    const existing = this.subscriptions.get(destination);

    if (existing) {

      existing.callback = callback;

      return existing.liveSubscription;
    }

    const tracked: TrackedSubscription = {

      callback,

      liveSubscription:
        this.doSubscribe(
          destination,
          callback
        ),
    };

    this.subscriptions.set(destination, tracked);

    /*
     * Agar connection abhi nahi tha,
     * reconnect ke baad resubscribeAll()
     * isko automatically subscribe karega.
     */
    return tracked.liveSubscription;
  }

  // =========================================================
  // UNSUBSCRIBE
  // =========================================================

  unsubscribe(destination: string) {

    const tracked =
      this.subscriptions.get(
        destination
      );

    if (!tracked) {
      return;
    }

    tracked.liveSubscription
      ?.unsubscribe();

    this.subscriptions.delete(
      destination
    );
  }

  // =========================================================
  // PUBLISH
  // =========================================================

  publish(
    destination: string,
    body: unknown
  ): boolean {

    if (!this.client?.connected) {

      return false;
    }

    try {

      console.log("[STOMP] SEND:", destination, body);

      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });

      return true;

    } catch (error) {

      console.error("[STOMP] Publish failed:",error);

      return false;
    }
  }

  // =========================================================
  // EVENTS
  // =========================================================

  onConnectionChange(listener: ConnectionListener) {

    this.connectionListeners.add(listener);

    return () =>
        this.connectionListeners.delete(
        listener
      );
  }

  onError(listener: ErrorListener) {

    this.errorListeners.add(
      listener
    );

    return () =>
      this.errorListeners.delete(listener);
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  disconnect() {

    this.subscriptions
      .forEach(tracked =>
        tracked.liveSubscription
          ?.unsubscribe()
      );

    this.subscriptions.clear();

    if (this.client) {

      this.client.deactivate();

      this.client = null;
    }

    console.log("[STOMP] Disconnected");
  }

  isConnected() {
    return (this.client?.connected === true);
  }
}

export const stompClient = new StompClientService();