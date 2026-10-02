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
 * Thin wrapper around a single shared @stomp/stompjs Client for the
 * whole app.
 *
 * Responsibilities that make this production-safe, beyond a bare
 * `new Client(...)`:
 *
 * 1. AUTHENTICATION - attaches the current JWT as a STOMP CONNECT
 *    header (`Authorization: Bearer <token>`), matching how the REST
 *    api-client attaches it. The backend's StompAuthChannelInterceptor
 *    validates this on every CONNECT.
 *
 * 2. RESUBSCRIBE ON RECONNECT - stompjs's built-in `reconnectDelay`
 *    reconnects the *socket*, but it does NOT remember your previous
 *    subscriptions across that reconnect (each reconnect is a brand
 *    new STOMP session). Without re-issuing SUBSCRIBE frames in
 *    onConnect, a bus going through a tunnel or a passenger's phone
 *    briefly losing signal would silently stop updating with no
 *    error - exactly the failure mode you can't afford in a tracking
 *    app. We keep a destination -> callback map and replay every
 *    subscription each time onConnect fires.
 *
 * 3. HEARTBEATS - matches the backend's 10s/10s STOMP heartbeat, so a
 *    dead connection is detected in seconds instead of relying on the
 *    OS/network stack's much longer TCP timeout.
 *
 * 4. ERROR QUEUE - auto-subscribes to the per-user "/user/queue/errors"
 *    destination so callers can surface backend-side rejections (e.g.
 *    "GPS rejected: trip not in progress") instead of failing silently.
 */
class StompClientService {
  private client: Client | null = null;

  private subscriptions = new Map<string, TrackedSubscription>();

  private connectionListeners = new Set<ConnectionListener>();
  private errorListeners = new Set<ErrorListener>();

  private connectingPromise: Promise<void> | null = null;

  /**
   * Ensures the client is connected and authenticated. Safe to call
   * many times concurrently (e.g. from several screens' hooks) - all
   * callers share the same in-flight connection attempt.
   */
  async connect(): Promise<void> {
    if (this.client?.connected) {
      return;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = this.doConnect();

    try {
      await this.connectingPromise;
    } finally {
      this.connectingPromise = null;
    }
  }

  private async doConnect(): Promise<void> {
    const token = await getAccessToken();

    if (!token) {
      throw new Error(
        "Cannot open live-tracking connection: user is not signed in."
      );
    }

    return new Promise((resolve, reject) => {
      const client = new Client({
        brokerURL: ENV.WS_URL,

        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        reconnectDelay: 5000,

        // Matches the backend's setHeartbeatValue([10000, 10000]) in
        // WebSocketConfig, so both sides detect a dead socket quickly.
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        debug: (message) => {
          if (__DEV__) {
            console.log("[STOMP]", message);
          }
        },

        onConnect: () => {
          console.log("[STOMP] Connected");

          this.resubscribeAll();
          this.subscribeToErrorQueue();

          this.connectionListeners.forEach((listener) => listener(true));

          resolve();
        },

        onStompError: (frame) => {
          const message =
            frame.headers["message"] || "STOMP broker error";

          console.error("[STOMP] Broker error:", message, frame.body);

          this.errorListeners.forEach((listener) => listener(message));

          reject(new Error(message));
        },

        onWebSocketError: (event) => {
          console.error("[STOMP] WebSocket error:", event);

          this.errorListeners.forEach((listener) =>
            listener("WebSocket connection error")
          );

          // If this happens before the very first CONNECT succeeds,
          // the promise from connect() must not hang forever waiting
          // on a resolve/reject that will never come from onConnect.
          // (Safe to call after the promise has already settled -
          // a second resolve/reject is simply ignored by the Promise
          // spec, which is what happens on later reconnect attempts.)
          reject(new Error("WebSocket connection error"));
        },

        onWebSocketClose: (event) => {
          console.log(
            "[STOMP] Connection closed:",
            event.code,
            event.reason
          );

          this.connectionListeners.forEach((listener) => listener(false));
        },

        onDisconnect: () => {
          this.connectionListeners.forEach((listener) => listener(false));
        },

        onUnhandledMessage: (message) => {
          console.log("[STOMP] Unhandled message:", message.body);
        },
      });

      this.client = client;

      client.activate();
    });
  }

  /**
   * Re-issues every tracked destination's SUBSCRIBE frame against the
   * current (possibly brand new, post-reconnect) STOMP session.
   */
  private resubscribeAll() {
    this.subscriptions.forEach((tracked, destination) => {
      tracked.liveSubscription = this.doSubscribe(destination, tracked.callback);
    });
  }

  private subscribeToErrorQueue() {
    if (!this.client?.connected) return;

    // Server resolves "/user/queue/errors" to this session's private
    // queue - see setUserDestinationPrefix("/user") in WebSocketConfig.
    this.client.subscribe("/user/queue/errors", (message) => {
      try {
        const error = JSON.parse(message.body);
        console.warn("[STOMP] Server-side error:", error);
        this.errorListeners.forEach((listener) =>
          listener(error.message ?? "Live tracking error")
        );
      } catch {
        this.errorListeners.forEach((listener) => listener(message.body));
      }
    });
  }

  private doSubscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): StompSubscription | null {
    if (!this.client?.connected) {
      return null;
    }

    return this.client.subscribe(destination, callback);
  }

  /**
   * Subscribes to a destination. If the socket isn't connected yet,
   * the subscription is remembered and activated automatically once
   * connect() succeeds (or on every future reconnect).
   */
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
      liveSubscription: this.doSubscribe(destination, callback),
    };

    this.subscriptions.set(destination, tracked);

    return tracked.liveSubscription;
  }

  unsubscribe(destination: string) {
    const tracked = this.subscriptions.get(destination);

    if (!tracked) return;

    tracked.liveSubscription?.unsubscribe();

    this.subscriptions.delete(destination);
  }

  /**
   * Sends a STOMP frame to an /app destination, e.g. a driver pushing
   * a GPS point to /app/trips/{tripId}/location. Returns false if the
   * socket isn't currently connected so the caller can fall back to
   * REST (see useDriverLocationBroadcaster).
   */
  publish(destination: string, body: unknown): boolean {
    if (!this.client?.connected) {
      return false;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });

    return true;
  }

  onConnectionChange(listener: ConnectionListener) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  onError(listener: ErrorListener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  disconnect() {
    this.subscriptions.forEach((tracked) => {
      tracked.liveSubscription?.unsubscribe();
    });

    this.subscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    console.log("[STOMP] Disconnected.");
  }

  isConnected() {
    return this.client?.connected === true;
  }
}

export const stompClient = new StompClientService();
