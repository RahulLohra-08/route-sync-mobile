import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/services/api/api-client";
import { getDriverByUserId, type DriverProfile } from "./profile.api";

/** Loads the signed-in driver's employee/licence record once (and on demand). */
export function useDriverProfile(userId: string | undefined, enabled: boolean) {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setDriver(await getDriverByUserId(userId));
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load driver details."));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (enabled && userId) void load();
  }, [enabled, userId, load]);

  return { driver, loading, error, reload: load };
}
