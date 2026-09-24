import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { parseLocal } from '@/utils/date';
import { passengerApi } from './passenger.api';
import { TripStatus } from './passenger.enums';
import type { RouteResponse, TripResponse } from './passenger.types';

export type TripFilter = 'ALL' | 'LIVE' | 'BOARDING' | 'SCHEDULED';

type LoadMode = 'initial' | 'refresh' | 'silent';
const POLL_MS = 20_000;

const errorMessage = (e: unknown) => {
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message ?? err?.message ?? 'Check your connection and try again.';
};

export function usePassengerDashboard() {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (mode: LoadMode = 'silent') => {
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'initial') setError(null);

    // Trips and routes are independent: one failing shouldn't blank the screen.
    const [t, r] = await Promise.allSettled([
      passengerApi.getAvailableTrips(),
      passengerApi.getActiveRoutes(),
    ]);
    if (!mounted.current) return;

    if (t.status === 'fulfilled') {
      setTrips(t.value);
      setError(null);
    } else if (mode !== 'silent') {
      setError(errorMessage(t.reason));
    }
    if (r.status === 'fulfilled') setRoutes(r.value);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load('initial');
    return () => {
      mounted.current = false;
    };
  }, [load]);

  // Poll only while the tab is focused so we don't drain battery in the background.
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => load('silent'), POLL_MS);
      return () => clearInterval(id);
    }, [load]),
  );

  const upcoming = useMemo(
    () =>
      trips
        .filter((t) => t.status !== TripStatus.COMPLETED && t.status !== TripStatus.CANCELLED)
        .sort(
          (a, b) =>
            (parseLocal(a.scheduledStartTime)?.getTime() ?? 0) -
            (parseLocal(b.scheduledStartTime)?.getTime() ?? 0),
        ),
    [trips],
  );

  const liveTrips = useMemo(() => upcoming.filter((t) => t.status === TripStatus.IN_PROGRESS), [upcoming]);
  const boardingTrips = useMemo(() => upcoming.filter((t) => t.status === TripStatus.BOARDING), [upcoming]);
  const scheduledTrips = useMemo(() => upcoming.filter((t) => t.status === TripStatus.SCHEDULED), [upcoming]);

  // The bus a passenger most likely cares about right now.
  const featuredTrip = liveTrips[0] ?? boardingTrips[0] ?? scheduledTrips[0] ?? null;

  const routesById = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);

  return {
    trips: upcoming,
    routes,
    routesById,
    liveTrips,
    boardingTrips,
    scheduledTrips,
    featuredTrip,
    loading,
    refreshing,
    error,
    refresh: () => load('refresh'),
    reload: () => {
      setLoading(true);
      return load('initial');
    },
  };
}
