// src/features/routes/useRouteStops.ts
// GET /api/v1/routes/{routeId}/stops/active  (any authenticated role).
import { useCallback, useEffect, useState } from "react";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { StopResponse } from "@/features/passenger/passenger.types";

export function useRouteStops(routeId: string | null | undefined, enabled = true) {
  const [stops, setStops] = useState<StopResponse[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!routeId) return;
    setFailed(false);
    try {
      const data = await passengerApi.getRouteStops(routeId);
      setStops([...data].sort((a, b) => a.stopOrder - b.stopOrder));
    } catch {
      setFailed(true);
      setStops([]);
    }
  }, [routeId]);

  useEffect(() => {
    if (enabled && routeId) void load();
  }, [enabled, routeId, load]);

  return { stops, failed, reload: load };
}
