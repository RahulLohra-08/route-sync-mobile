// src/features/routes/useMyStop.ts
//
// "My boarding stop" per route, stored ON THE DEVICE ONLY (expo-secure-store,
// already a dependency). The backend has no passenger-stop/pass model, so this
// is a local preference. Keyed by user id so another account on the same phone
// never sees it.
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

export function useMyStop(routeId: string | null | undefined) {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const key = userId && routeId ? `routesync.myStop.${userId}.${routeId}` : null;
  const [myStopId, setMyStopId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setMyStopId(null);
    if (!key) return;
    SecureStore.getItemAsync(key)
      .then((v) => !cancelled && setMyStopId(v))
      .catch(() => undefined)
      .finally(() => !cancelled && setReady(true));
    return () => { cancelled = true; };
  }, [key]);

  /** Toggle: setting the current "my stop" again clears it. */
  const toggle = useCallback(async (stopId: string) => {
    if (!key) return;
    const next = myStopId === stopId ? null : stopId;
    setMyStopId(next); // optimistic: instant UI, storage failure is non-critical
    try {
      if (next) await SecureStore.setItemAsync(key, next);
      else await SecureStore.deleteItemAsync(key);
    } catch { /* preference simply won't persist */ }
  }, [key, myStopId]);

  return { myStopId, ready, toggle };
}
