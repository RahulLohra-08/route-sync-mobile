// src/services/websocket/stomp-client.ts
//
// RouteSync's single shared STOMP connection.
//
// Backend contract (verified in source):
//   endpoint     : ws(s)://<host>/ws  (raw WebSocket, no SockJS)
//   CONNECT auth : `Authorization: Bearer <access JWT>` header
//   subscribe    : /topic/trips/{tripId}/location   (PASSENGER / DRIVER(own trip) / ADMIN)
//                  /user/queue/location-ack         (driver: GPS persisted)
//                  /user/queue/errors               (WsErrorMessage)
//   send         : /app/trips/{tripId}/location     (DRIVER only, trip IN_PROGRESS)
//   heartbeat    : 10 s / 10 s
//
// Lifecycle model (Henglish: ek hi connection, sab screens share karti hain):
//   retain()  -> screen says "I need the socket"; first caller connects.
//   release() -> last caller leaving closes the socket after a short grace
//                period (tab switches don't thrash the connection).
//   subscribe() returns an unsubscribe fn; many handlers per destination.
import { ENV } from "@/config/env";
import { MAX_RECONNECT_FAILURES } from "@/features/tracking/tracking.logic";
import type {
  ConnectionState,
  WsErrorMessage,
} from "@/features/tracking/tracking.types";
import { getValidAccessToken } from "@/services/auth/token-refresh";
import {
  Client,
  ReconnectionTimeMode,
  type IMessage,
  type StompSubscription,
} from "@stomp/stompjs";
import { AppState, type AppStateStatus } from "react-native";

type MessageHandler = (message: IMessage) => void;
type StateListener = () => void;

interface Topic {
  handlers: Set<MessageHandler>;
  sub: StompSubscription | null;
}

/** Keep the socket warm briefly after the last screen leaves (tab switches). */
const RELEASE_GRACE_MS = 8_000;
/** A connection must survive this long before we forgive earlier failures. */
const STABLE_AFTER_MS = 10_000;
/** From this many consecutive failures we tell the UI we are effectively offline. */
const OFFLINE_AFTER_FAILURES = 3;

/** Never let a JWT reach the console, even in dev (stompjs logs CONNECT headers). */
const redact = (line: string) =>
  line.replace(/(Authorization:\s*Bearer\s+)[^\s\\]+/gi, "$1[REDACTED]");

class StompClientService {
  private client: Client | null = null;
  private state: ConnectionState = "idle";
  private epoch = 0;
  private everConnected = false;
  private failures = 0;
  private users = 0;
  private forceFreshToken = false;
  private lastError: string | null = null;
  private stableTimer: ReturnType<typeof setTimeout> | null = null;
  private releaseTimer: ReturnType<typeof setTimeout> | null = null;
  private appStateSub: { remove: () => void } | null = null;

  private topics = new Map<string, Topic>();
  private stateListeners = new Set<StateListener>();
  private serverErrorListeners = new Set<(e: WsErrorMessage) => void>();
  private ackListeners = new Set<() => void>();

  // ---------------------------------------------------------------- state
  getState = (): ConnectionState => this.state;
  /** Increments on every successful (re)connect; hooks use it to re-sync. */
  getEpoch = (): number => this.epoch;
  getLastError = (): string | null => this.lastError;
  isConnected = (): boolean => this.client?.connected === true;

  /** useSyncExternalStore-compatible. */
  subscribeState = (listener: StateListener) => {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  };

  private setState(next: ConnectionState) {
    if (this.state === next) return;
    this.state = next;
    this.stateListeners.forEach((l) => l());
  }

  // ------------------------------------------------------------ lifecycle
  /** Declare that a screen needs the socket. Call the returned fn when done. */
  retain(): () => void {
    this.users += 1;
    if (this.releaseTimer) {
      clearTimeout(this.releaseTimer);
      this.releaseTimer = null;
    }
    this.watchAppState();
    if (!this.client) this.start();

    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.users = Math.max(0, this.users - 1);
      if (this.users === 0) {
        this.releaseTimer = setTimeout(() => {
          if (this.users === 0) this.stop("idle");
        }, RELEASE_GRACE_MS);
      }
    };
  }

  /** User-initiated retry (e.g. "Retry" button after state === "error"). */
  retry() {
    if (this.users === 0) return;
    this.failures = 0;
    this.forceFreshToken = true;
    this.stop("connecting");
    this.start();
  }

  /** Hard reset (logout). Drops every subscription and handler. */
  disconnect() {
    this.users = 0;
    if (this.releaseTimer) clearTimeout(this.releaseTimer);
    this.releaseTimer = null;
    this.topics.forEach((t) => this.safeUnsubscribe(t.sub));
    this.topics.clear();
    this.stop("idle");
    this.appStateSub?.remove();
    this.appStateSub = null;
    this.everConnected = false;
    this.lastError = null;
  }

  private start() {
    this.everConnected = this.everConnected && this.state !== "idle";
    this.setState(this.everConnected ? "reconnecting" : "connecting");

    const client = new Client({
      brokerURL: ENV.WS_URL,
      // stompjs does the scheduling; we cap the number of failures ourselves.
      reconnectDelay: 2_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      maxReconnectDelay: 30_000,
      connectionTimeout: 10_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      // Needed for Hermes + Spring (NULL-terminated frame handling). Kept from
      // the original implementation - do not remove.
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (line) => {
        if (__DEV__) console.log("[STOMP]", redact(line));
      },

      beforeConnect: async () => {
        // MUST NOT throw: stompjs would surface an unhandled rejection.
        try {
          const token = await getValidAccessToken(this.forceFreshToken);
          this.forceFreshToken = false;
          if (!token) {
            this.halt("Your session has expired. Please sign in again.");
            return;
          }
          client.connectHeaders = { Authorization: `Bearer ${token}` };
        } catch {
          // Refresh failed transiently (offline). Connect without a token; the
          // server rejects it and the failure counter / backoff handles it.
          client.connectHeaders = {};
        }
      },

      onConnect: () => {
        this.epoch += 1;
        this.everConnected = true;
        this.lastError = null;

        // New STOMP session => old subscription objects are dead. Re-create
        // them BEFORE announcing "connected" so listeners that re-fetch a REST
        // snapshot on reconnect cannot miss frames in the gap.
        this.topics.forEach((topic, destination) => {
          topic.sub = null;
          this.attach(destination, topic);
        });
        this.subscribePrivateQueues(client);

        if (this.stableTimer) clearTimeout(this.stableTimer);
        this.stableTimer = setTimeout(() => {
          this.failures = 0;
        }, STABLE_AFTER_MS);

        this.setState("connected");
      },

      onStompError: (frame) => {
        // Spring answers a rejected CONNECT/SUBSCRIBE with an ERROR frame and
        // then closes the socket (counted in onWebSocketClose).
        this.lastError = frame.headers["message"] || "Live tracking was rejected by the server";
        this.forceFreshToken = true; // most likely cause: expired/invalid JWT
      },

      onWebSocketClose: () => {
        if (this.stableTimer) {
          clearTimeout(this.stableTimer);
          this.stableTimer = null;
        }
        // Deliberate stop()/halt(): nothing to do.
        if (this.client !== client || this.state === "error" || this.state === "idle") return;

        this.failures += 1;
        if (this.failures >= MAX_RECONNECT_FAILURES) {
          this.halt(this.lastError ?? "Could not reach live tracking. Please retry.");
          return;
        }
        if (this.failures >= OFFLINE_AFTER_FAILURES) {
          this.setState("disconnected");
        } else {
          this.setState(this.everConnected ? "reconnecting" : "connecting");
        }
      },
    });

    this.client = client;
    client.activate();
  }

  /** Close the transport. Handlers/topics are kept so a later start() restores them. */
  private stop(nextState: ConnectionState) {
    if (this.stableTimer) clearTimeout(this.stableTimer);
    this.stableTimer = null;
    const client = this.client;
    this.client = null;
    this.topics.forEach((t) => {
      t.sub = null;
    });
    if (client) void client.deactivate().catch(() => undefined);
    this.setState(nextState);
  }

  /** Fatal: stop auto-reconnecting and surface the reason. */
  private halt(message: string) {
    this.lastError = message;
    this.stop("error");
  }

  // ------------------------------------------------------- subscriptions
  /**
   * Subscribe to a destination. Safe to call before the socket is connected
   * (it attaches on connect) and from many screens at once (handlers are a
   * set per destination, one STOMP subscription underneath).
   */
  subscribe(destination: string, handler: MessageHandler): () => void {
    let topic = this.topics.get(destination);
    if (!topic) {
      topic = { handlers: new Set(), sub: null };
      this.topics.set(destination, topic);
    }
    topic.handlers.add(handler);
    if (!topic.sub) this.attach(destination, topic);

    return () => {
      const current = this.topics.get(destination);
      if (!current) return;
      current.handlers.delete(handler);
      if (current.handlers.size === 0) {
        this.safeUnsubscribe(current.sub);
        this.topics.delete(destination);
      }
    };
  }

  private attach(destination: string, topic: Topic) {
    if (!this.client?.connected || topic.sub) return;
    topic.sub = this.client.subscribe(destination, (message) => {
      // Read the live handler set: handlers may have changed since attach().
      this.topics.get(destination)?.handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          if (__DEV__) console.warn("[STOMP] handler threw:", error);
        }
      });
    });
  }

  private safeUnsubscribe(sub: StompSubscription | null) {
    try {
      sub?.unsubscribe();
    } catch {
      /* socket already closed */
    }
  }

  private subscribePrivateQueues(client: Client) {
    client.subscribe("/user/queue/location-ack", () => {
      this.ackListeners.forEach((l) => l());
    });
    client.subscribe("/user/queue/errors", (message) => {
      let parsed: WsErrorMessage;
      try {
        parsed = JSON.parse(message.body) as WsErrorMessage;
      } catch {
        parsed = {
          code: "UNKNOWN",
          message: "Live tracking error",
          destination: "",
          timestamp: new Date().toISOString(),
        };
      }
      this.serverErrorListeners.forEach((l) => l(parsed));
    });
  }

  // ------------------------------------------------------------- publish
  /**
   * Hands a frame to the socket. `true` means ONLY "queued on an open socket",
   * NOT "the server accepted it". Acceptance arrives on /user/queue/location-ack
   * (see onAck) and rejection on /user/queue/errors (see onServerError).
   */
  publish(destination: string, body: unknown): boolean {
    if (!this.client?.connected) return false;
    try {
      this.client.publish({ destination, body: JSON.stringify(body) });
      return true;
    } catch {
      return false;
    }
  }

  /** Fires when the server confirms it persisted a driver GPS point. */
  onAck(listener: () => void) {
    this.ackListeners.add(listener);
    return () => {
      this.ackListeners.delete(listener);
    };
  }

  /** Application-level errors from /user/queue/errors (e.g. validation). */
  onServerError(listener: (error: WsErrorMessage) => void) {
    this.serverErrorListeners.add(listener);
    return () => {
      this.serverErrorListeners.delete(listener);
    };
  }

  // --------------------------------------------------------- app state
  private watchAppState() {
    if (this.appStateSub) return;
    this.appStateSub = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        // Coming back to the foreground: a socket that died in the background
        // would otherwise wait out a long backoff. Retry immediately instead.
        if (
          status === "active" &&
          this.users > 0 &&
          this.state !== "connected" &&
          this.state !== "error"
        ) {
          this.retry();
        }
      },
    );
  }
}

export const stompClient = new StompClientService();
