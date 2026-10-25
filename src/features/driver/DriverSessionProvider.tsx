// src/features/driver/DriverSessionProvider.tsx
//
// Mounted ONCE in the (driver) layout. Owns the driver's trips and the single
// GPS-sharing loop, so switching tabs can never start a second loop or stop the
// first one. Endpoints (DriverTripController, role DRIVER):
//   GET   /api/v1/driver/trips                 PATCH .../{id}/start
//   PATCH /api/v1/driver/trips/{id}/complete   PATCH .../{id}/cancel
// Backend rules mirrored here: start from SCHEDULED|BOARDING; complete from
// IN_PROGRESS; cancel unless COMPLETED/CANCELLED; GPS only while IN_PROGRESS.
import {
    useDriverLocationBroadcaster,
    type DriverLocationSharing,
} from "@/features/tracking/hooks/useDriverLocationBroadcaster";
import { parseServerTime } from "@/features/tracking/tracking.logic";
import { getApiErrorMessage } from "@/services/api/api-client";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { driverApi } from "../driver/driver.api";
import type { DriverTripResponse } from "../driver/driver.types";

export type DriverAction = "start" | "complete" | "cancel";

interface DriverSession {
  trips: DriverTripResponse[];
  activeTrip: DriverTripResponse | null;
  nextTrip: DriverTripResponse | null;
  upcoming: DriverTripResponse[];
  history: DriverTripResponse[];
  loading: boolean;
  refreshing: boolean;
  loadError: string | null;
  actionError: string | null;
  /** Which action is in flight (null = idle). Buttons use it to block double taps. */
  busy: { tripId: string; action: DriverAction } | null;
  gps: DriverLocationSharing;
  refresh: () => Promise<void>;
  startTrip: (tripId: string) => Promise<boolean>;
  completeTrip: (tripId: string) => Promise<boolean>;
  cancelTrip: (tripId: string) => Promise<boolean>;
}

const Ctx = createContext<DriverSession | null>(null);

export function useDriverSession(): DriverSession {
  const value = useContext(Ctx);
  if (!value)
    throw new Error(
      "useDriverSession must be used inside DriverSessionProvider",
    );
  return value;
}

const byStart = (a: DriverTripResponse, b: DriverTripResponse) =>
  (parseServerTime(a.scheduledStartTime) ?? 0) -
  (parseServerTime(b.scheduledStartTime) ?? 0);

export function DriverSessionProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<DriverTripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<DriverSession["busy"]>(null);
  const busyRef = useRef(false); // synchronous guard: state updates are async

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      setTrips(await driverApi.getMyTrips());
      setLoadError(null);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, "Could not load your trips."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void load("initial");
  }, [load]);

  const activeTrip = useMemo(
    () => trips.find((t) => t.status === "IN_PROGRESS") ?? null,
    [trips],
  );
  const upcoming = useMemo(
    () =>
      trips
        .filter((t) => t.status === "SCHEDULED" || t.status === "BOARDING")
        .sort(byStart),
    [trips],
  );
  const history = useMemo(
    () =>
      trips
        .filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED")
        .sort((a, b) => byStart(b, a)),
    [trips],
  );

  // The ONE GPS loop for the whole driver app.
  const gps = useDriverLocationBroadcaster({
    tripId: activeTrip?.id,
    enabled: !!activeTrip,
  });

  const run = useCallback(
    async (
      tripId: string,
      action: DriverAction,
      call: () => Promise<DriverTripResponse>,
    ) => {
      if (busyRef.current) return false; // ignore repeated taps
      busyRef.current = true;
      setBusy({ tripId, action });
      setActionError(null);
      try {
        const updated = await call();
        setTrips((cur) => cur.map((t) => (t.id === updated.id ? updated : t)));
        return true;
      } catch (e) {
        setActionError(getApiErrorMessage(e, `Could not ${action} the trip.`));
        return false;
      } finally {
        busyRef.current = false;
        setBusy(null);
      }
    },
    [],
  );

  const startTrip = useCallback(
    async (tripId: string) => {
      if (activeTrip && activeTrip.id !== tripId) {
        setActionError(
          "Finish or cancel your current trip before starting another.",
        );
        return false;
      }
      // Ask for location BEFORE the backend flips the trip to IN_PROGRESS, so a
      // trip is never "running" without any way to share its position.
      const permission = await gps.requestPermission();
      if (permission !== "granted") {
        setActionError(
          permission === "services-off"
            ? "Turn on your device's location services to start the trip."
            : "Location permission is required to share the bus position. Allow it in Settings and try again.",
        );
        return false;
      }
      return run(tripId, "start", () => driverApi.startTrip(tripId));
    },
    [activeTrip, gps, run],
  );
  const completeTrip = useCallback(
    (id: string) => run(id, "complete", () => driverApi.completeTrip(id)),
    [run],
  );
  const cancelTrip = useCallback(
    (id: string) => run(id, "cancel", () => driverApi.cancelTrip(id)),
    [run],
  );

  const value: DriverSession = {
    trips,
    activeTrip,
    nextTrip: upcoming[0] ?? null,
    upcoming,
    history,
    loading,
    refreshing,
    loadError,
    actionError,
    busy,
    gps,
    refresh: () => load("refresh"),
    startTrip,
    completeTrip,
    cancelTrip,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
