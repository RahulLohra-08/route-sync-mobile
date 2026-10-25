// src/features/tracking/components/TripEtaPanel.tsx
//
// "When will it reach MY stop?"  Backed ONLY by the real backend calculation:
//   GET /api/v1/routes/{routeId}/stops/active          -> stop chips
//   GET /api/v1/passenger/trips/{tripId}/eta?stopId=   -> TripEtaResponse
// If the backend says it can't estimate (stale GPS, bus too slow, ...), we show
// ITS message and no number. Nothing here is computed on the phone.
import AppText from "@/components/common/AppText";
import { Skeleton } from "@/components/feedback/Skeleton";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { StopResponse } from "@/features/passenger/passenger.types";
import { getApiErrorMessage } from "@/services/api/api-client";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { parseServerTime } from "../tracking.logic";
import { getTripEta } from "../tracking.service";
import type { TripEta } from "../tracking.types";

/** ETA depends on the bus's moving position; refresh gently, only while visible. */
const ETA_REFRESH_MS = 20_000;

interface Props {
  tripId: string;
  routeId: string | null | undefined;
  /** False when the trip isn't running; hides the panel entirely. */
  enabled: boolean;
}

const methodLabel = (method: string) =>
  method === "OSRM_ROAD_DISTANCE_AND_CURRENT_SPEED"
    ? "Based on road distance and the bus's current speed"
    : method === "ORDERED_STOPS_GEOGRAPHIC_DISTANCE_AND_CURRENT_SPEED"
      ? "Approximate: straight-line stop distance and current speed"
      : "";

export function TripEtaPanel({ tripId, routeId, enabled }: Props) {
  const [stops, setStops] = useState<StopResponse[] | null>(null);
  const [stopsFailed, setStopsFailed] = useState(false);
  const [stopId, setStopId] = useState<string | null>(null);
  const [eta, setEta] = useState<TripEta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  useEffect(() => {
    if (!enabled || !routeId) return;
    let cancelled = false;
    passengerApi
      .getRouteStops(routeId)
      .then((data) => {
        if (!cancelled)
          setStops([...data].sort((a, b) => a.stopOrder - b.stopOrder));
      })
      .catch(() => {
        if (!cancelled) setStopsFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, routeId]);

  const loadEta = useCallback(
    async (silent: boolean) => {
      if (!stopId) return;
      const mine = ++request.current;
      if (!silent) setLoading(true);
      try {
        const data = await getTripEta(tripId, stopId);
        if (mine !== request.current) return;
        setEta(data);
        setError(null);
      } catch (e) {
        if (mine !== request.current) return;
        setError(getApiErrorMessage(e, "Could not get an arrival estimate."));
      } finally {
        if (mine === request.current) setLoading(false);
      }
    },
    [tripId, stopId],
  );

  useEffect(() => {
    if (!enabled || !stopId) return;
    setEta(null);
    void loadEta(false);
    const id = setInterval(() => void loadEta(true), ETA_REFRESH_MS);
    return () => clearInterval(id);
  }, [enabled, stopId, loadEta]);

  if (!enabled || !routeId) return null;
  if (stopsFailed || (stops && stops.length === 0)) {
    return (
      <AppText variant="caption" style={styles.muted}>
        Stop information isn't available for this route, so no arrival estimate
        can be shown.
      </AppText>
    );
  }

  const minutes =
    eta?.etaMinutes != null ? Math.max(1, Math.round(eta.etaMinutes)) : null;
  const arrivalMs = parseServerTime(eta?.estimatedArrivalAt);

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyMedium">Arrival at your stop</AppText>

      {stops === null ? (
        <Skeleton height={36} radius={radius.pill} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {stops.map((stop) => {
            const selected = stop.id === stopId;
            return (
              <Pressable
                key={stop.id}
                onPress={() => setStopId(stop.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Stop ${stop.stopOrder}: ${stop.stopName}`}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <AppText
                  variant="caption"
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {stop.stopName}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {!stopId ? (
        <AppText variant="caption" style={styles.muted}>
          Choose a stop to see when the bus should arrive.
        </AppText>
      ) : loading && !eta ? (
        <Skeleton height={44} radius={radius.md} />
      ) : error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : eta && minutes !== null ? (
        <View
          accessible
          accessibilityLabel={`About ${minutes} minutes to ${eta.stopName ?? "the stop"}`}
        >
          <View style={styles.row}>
            <AppText variant="h1" style={styles.big}>
              ~{minutes}
            </AppText>
            <AppText variant="bodyMedium" style={styles.unit}>
              min
            </AppText>
            {arrivalMs !== null && (
              <AppText variant="caption" style={styles.muted}>
                {"  "}around {formatTime(new Date(arrivalMs))}
              </AppText>
            )}
          </View>
          {eta.distanceKm != null && (
            <AppText variant="caption" style={styles.muted}>
              {eta.distanceKm.toFixed(1)} km away.{" "}
              {methodLabel(eta.calculationMethod)}
            </AppText>
          )}
        </View>
      ) : eta ? (
        // Backend declined to estimate: show ITS reason, never a made-up time.
        <AppText variant="caption" style={styles.warn}>
          Arrival time unavailable. {eta.message ?? ""}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  chipSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  chipText: { color: colors.text.secondary, fontWeight: "600" },
  chipTextSelected: { color: colors.primary[700] },
  row: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  big: { color: colors.primary[700] },
  unit: { color: colors.primary[700] },
  muted: { color: "#64748B" },
  warn: { color: "#B45309" },
  error: { color: colors.status.error },
});
