export interface TripLocationWebSocketMessage {
  tripId: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeCode: string;

  latitude: number;
  longitude: number;

  speed: number | null;
  heading: number | null;
  accuracy: number | null;

  recordedAt: string;
}

/** Mirrors the backend's WsErrorMessage, delivered on /user/queue/errors. */
export interface WsErrorMessage {
  code: string;
  message: string;
  destination: string;
  timestamp: string;
}

export type TrackingConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";