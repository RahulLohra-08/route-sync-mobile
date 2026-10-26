// src/features/buses/useBusDirectory.ts
// GET /api/v1/buses  +  passenger trips/routes (usePassengerDashboard).
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePassengerDashboard } from "@/features/passenger/usePassengerDashboard";
import type { BusResponse } from "@/features/passenger/passenger.types";
import { passengerApi } from "@/features/passenger/passenger.api";
import { getApiErrorMessage } from "@/services/api/api-client";
import { buildBusEntries } from "./busStatus";

export function useBusDirectory() {
  const dash = usePassengerDashboard();
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [busLoading, setBusLoading] = useState(true);
  const [busError, setBusError] = useState<string | null>(null);

  const loadBuses = useCallback(async () => {
    try {
      setBuses(await passengerApi.getBuses());
      setBusError(null);
    } catch (e) {
      setBusError(getApiErrorMessage(e, "Could not load buses."));
    } finally {
      setBusLoading(false);
    }
  }, []);
  useEffect(() => { void loadBuses(); }, [loadBuses]);

  const entries = useMemo(
    () => buildBusEntries(buses, dash.trips, dash.routesById),
    [buses, dash.trips, dash.routesById],
  );

  return {
    entries,
    loading: busLoading || dash.loading,
    refreshing: dash.refreshing,
    error: busError ?? (buses.length === 0 ? dash.error : null),
    refresh: async () => { await Promise.all([dash.refresh(), loadBuses()]); },
  };
}
