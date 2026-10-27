// src/features/tracking/components/TripStopsPanel.tsx
//
// Route timeline + the REAL backend arrival estimate for the selected stop.
//   GET /api/v1/passenger/trips/{tripId}/eta?stopId=...  -> TripEtaResponse
// If the backend can't estimate it says why; we show that and no number.
// Nothing is computed on the phone. (Stops themselves come from the parent.)
import AppText from "@/components/common/AppText";
import { Skeleton } from "@/components/feedback/Skeleton";
import type { StopResponse } from "@/features/passenger/passenger.types";
import { RouteStops } from "@/features/routes/RouteStops";
import { getApiErrorMessage } from "@/services/api/api-client";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { parseServerTime } from "../tracking.logic";
import { getTripEta } from "../tracking.service";
import type { TripEta } from "../tracking.types";

/** ETA moves with the bus; refresh gently, only while a stop is selected. */
const ETA_REFRESH_MS = 20_000;

interface Props {
  tripId: string;
  stops: StopResponse[] | null;
  stopsFailed: boolean;
  selectedStopId: string | null;
  onSelect: (stop: StopResponse) => void;
  /** Trip is IN_PROGRESS: ETA endpoint is only meaningful then. */
  running: boolean;
  onSelectedLayout?: (y: number) => void;
  busPosition?: { latitude: number; longitude: number } | null;
  myStopId?: string | null;
  onToggleMyStop?: (stop: StopResponse) => void;
}

const methodLabel = (m: string) =>
  m === "OSRM_ROAD_DISTANCE_AND_CURRENT_SPEED"
    ? "Road distance and current speed"
    : m === "ORDERED_STOPS_GEOGRAPHIC_DISTANCE_AND_CURRENT_SPEED"
      ? "Approximate: straight-line distance and current speed"
      : "";

export function TripStopsPanel({
  tripId,
  stops,
  stopsFailed,
  selectedStopId,
  onSelect,
  running,
  onSelectedLayout,
  busPosition,
  myStopId,
  onToggleMyStop,
}: Props) {
  const [eta, setEta] = useState<TripEta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const loadEta = useCallback(
    async (silent: boolean) => {
      if (!selectedStopId) return;
      const mine = ++request.current;
      if (!silent) setLoading(true);
      try {
        const data = await getTripEta(tripId, selectedStopId);
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
    [tripId, selectedStopId],
  );

  useEffect(() => {
    if (!running || !selectedStopId) return;
    setEta(null);
    void loadEta(false);
    const id = setInterval(() => void loadEta(true), ETA_REFRESH_MS);
    return () => clearInterval(id);
  }, [running, selectedStopId, loadEta]);

  if (stops === null) return <Skeleton height={120} radius={radius.lg} />;
  if (stopsFailed || stops.length === 0) {
    return (
      <AppText variant="caption" style={styles.muted}>
        Stop information isn't available for this route.
      </AppText>
    );
  }

  const minutes =
    eta?.etaMinutes != null ? Math.max(1, Math.round(eta.etaMinutes)) : null;
  const arrivalMs = parseServerTime(eta?.estimatedArrivalAt);

  let detail: React.ReactNode = null;
  if (!running) {
    detail = (
      <AppText variant="caption" style={styles.muted}>
        Live arrival appears once the trip starts.
      </AppText>
    );
  } else if (loading && !eta) {
    detail = <Skeleton height={36} radius={radius.md} />;
  } else if (error) {
    detail = (
      <AppText variant="caption" style={styles.error}>
        {error}
      </AppText>
    );
  } else if (eta && minutes !== null) {
    detail = (
      <View accessible accessibilityLabel={`About ${minutes} minutes`}>
        <View style={styles.etaRow}>
          {/* key => the number cross-fades (150 ms) whenever the estimate changes */}
          <Animated.View key={minutes} entering={FadeIn.duration(150)}>
            <AppText variant="h2" style={styles.big}>
              ~{minutes} min
            </AppText>
          </Animated.View>
          {arrivalMs !== null && (
            <AppText variant="caption" style={styles.muted}>
              around {formatTime(new Date(arrivalMs))}
            </AppText>
          )}
        </View>
        <AppText variant="caption" style={styles.muted}>
          {eta.distanceKm != null
            ? `${eta.distanceKm.toFixed(1)} km away · `
            : ""}
          {methodLabel(eta.calculationMethod)}
        </AppText>
      </View>
    );
  } else if (eta) {
    // Backend declined to estimate: show ITS reason, never an invented time.
    detail = (
      <AppText variant="caption" style={styles.warn}>
        Arrival time unavailable. {eta.message ?? ""}
      </AppText>
    );
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyMedium">Route stops</AppText>
      <AppText variant="caption" style={styles.muted}>
        Tap a stop to see its arrival estimate.
      </AppText>
      <RouteStops
        stops={stops}
        selectedStopId={selectedStopId}
        onSelect={onSelect}
        selectedDetail={detail}
        tripRunning={running}
        onSelectedLayout={onSelectedLayout}
        busPosition={busPosition}
        myStopId={myStopId}
        onToggleMyStop={onToggleMyStop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  big: { color: colors.primary[700] },
  muted: { color: "#64748B" },
  warn: { color: "#B45309" },
  error: { color: colors.status.error },
});
