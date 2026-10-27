// src/features/tracking/components/TripTrackingView.tsx
//
// Full passenger tracking experience for one trip: map-first layout with a
// status pill, transport banner and a details sheet. Used by the Track tab and
// the bus detail screen so both stay identical.
import AppText from "@/components/common/AppText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ConnectionBanner } from "@/components/tracking/ConnectionBanner";
import { TrackingStatusPill } from "@/components/tracking/TrackingStatusPill";
import { passengerApi } from "@/features/passenger/passenger.api";
import type {
  StopResponse,
  TripResponse,
} from "@/features/passenger/passenger.types";
import { useMyStop } from "@/features/routes/useMyStop";
import { useRouteStops } from "@/features/routes/useRouteStops";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HEALTH_META } from "../health-meta";
import { useTripTracking } from "../hooks/useTripTracking";
import { formatAgo, parseServerTime } from "../tracking.logic";
import { LiveBusMap } from "./LiveBusMap";
import { TripStopsPanel } from "./TripStopsPanel";

interface Props {
  tripId: string;
  onBack?: () => void;
}

export function TripTrackingView({ tripId, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const tracking = useTripTracking(tripId);
  const { fix, snapshot, health, connection, error, loading } = tracking;

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [following, setFollowing] = useState(true);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const stopsOffset = useRef(0); // Y of the stops block inside the sheet

  // Trip details (route name, driver, schedule) - one-off, not live data.
  useEffect(() => {
    let cancelled = false;
    passengerApi
      .getTripById(tripId)
      .then((t) => !cancelled && setTrip(t))
      .catch(() => undefined); // the snapshot already carries the essentials
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  // Keeps "updated 12 s ago" honest between frames.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  const status = snapshot?.status ?? trip?.status;
  const running = status === "IN_PROGRESS";
  const busNumber =
    snapshot?.busNumber ?? trip?.busNumber ?? fix?.busNumber ?? "Bus";
  const routeCode =
    snapshot?.routeCode ?? trip?.routeCode ?? fix?.routeCode ?? "";
  const recordedMs = parseServerTime(fix?.recordedAt);
  const routeId = snapshot?.routeId ?? trip?.routeId;
  const { stops, failed: stopsFailed } = useRouteStops(routeId);
  const myStop = useMyStop(routeId);
  // Open straight onto the passenger's saved stop (once), so the ETA to THEIR
  // stop is the first thing they see. Never overrides a manual choice.
  const autoSelected = useRef(false);
  useEffect(() => {
    if (autoSelected.current || !myStop.ready || !stops || !myStop.myStopId)
      return;
    if (stops.some((s) => s.id === myStop.myStopId)) {
      autoSelected.current = true;
      setSelectedStopId((cur) => cur ?? myStop.myStopId);
    }
  }, [myStop.ready, myStop.myStopId, stops]);
  const selectStop = (stop: StopResponse) =>
    setSelectedStopId((cur) => (cur === stop.id ? null : stop.id));
  const bannerMessage =
    connection === "error" || connection === "disconnected" ? error : null;

  return (
    <View style={styles.root}>
      <LiveBusMap
        fix={fix}
        health={health}
        following={following}
        onFollowingChange={setFollowing}
        stops={stops}
        selectedStopId={selectedStopId}
        bottomInset={sheetHeight}
      />

      <View
        style={[styles.top, { paddingTop: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        <View style={styles.topRow}>
          {onBack && (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.back}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={colors.text.primary}
              />
            </Pressable>
          )}
          <TrackingStatusPill health={health} />
        </View>
        <ConnectionBanner
          health={health}
          message={bannerMessage}
          onRetry={tracking.reconnect}
        />
      </View>

      <View
        style={[
          styles.sheet,
          {
            maxHeight: height * 0.62,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.grabber} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {loading && !snapshot && !trip ? (
            <>
              <Skeleton height={26} width="55%" />
              <Skeleton height={16} width="75%" />
              <Skeleton height={64} radius={radius.lg} />
            </>
          ) : (
            <>
              <View style={styles.headRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="h2">{busNumber}</AppText>
                  <AppText variant="caption" style={styles.muted}>
                    {[routeCode, trip?.routeName].filter(Boolean).join(" · ")}
                  </AppText>
                </View>
                {status && <StatusBadge status={status} />}
              </View>

              <View style={styles.metrics}>
                <Metric
                  label="Last update"
                  value={
                    recordedMs !== null
                      ? formatTime(new Date(recordedMs))
                      : fix
                        ? formatAgo(fix.receivedAt, now)
                        : "--"
                  }
                  hint={fix ? formatAgo(fix.receivedAt, now) : undefined}
                />
                <Metric
                  label="Speed"
                  value={
                    fix?.speedKmh != null
                      ? `${Math.round(fix.speedKmh)} km/h`
                      : "--"
                  }
                />
                <Metric label="Signal" value={HEALTH_META[health].label} />
              </View>

              {!fix && health !== "ended" && (
                <AppText variant="caption" style={styles.muted}>
                  {HEALTH_META[health].detail}
                </AppText>
              )}
              {health === "stale" && (
                <AppText variant="caption" style={styles.warn}>
                  Showing the last known position. It will update when the bus
                  sends fresh GPS.
                </AppText>
              )}

              {trip?.driverName && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color="#64748B"
                  />
                  <AppText variant="caption" style={styles.muted}>
                    Driver: {trip.driverName}
                  </AppText>
                </View>
              )}

              <View
                onLayout={(e) => (stopsOffset.current = e.nativeEvent.layout.y)}
              >
                <TripStopsPanel
                  tripId={tripId}
                  stops={stops}
                  stopsFailed={stopsFailed}
                  selectedStopId={selectedStopId}
                  onSelect={selectStop}
                  running={running}
                  busPosition={fix}
                  myStopId={myStop.myStopId}
                  onToggleMyStop={(stop) => void myStop.toggle(stop.id)}
                  // Smoothly bring the chosen stop into view inside the sheet.
                  onSelectedLayout={(y) =>
                    scrollRef.current?.scrollTo({
                      y: stopsOffset.current + y - 40,
                      animated: true,
                    })
                  }
                />
              </View>

              {!running &&
                status &&
                status !== "COMPLETED" &&
                status !== "CANCELLED" && (
                  <AppText variant="caption" style={styles.muted}>
                    This trip hasn't started yet. Live location and arrival
                    estimates appear once the driver starts it.
                  </AppText>
                )}

              <Pressable
                onPress={() => void tracking.refresh()}
                accessibilityRole="button"
                accessibilityLabel="Refresh trip information"
                style={styles.refresh}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={colors.primary[700]}
                />
                <AppText variant="caption" style={styles.refreshText}>
                  Refresh
                </AppText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View
      style={styles.metric}
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ""}`}
    >
      <AppText variant="caption" style={styles.muted}>
        {label}
      </AppText>
      <AppText variant="bodyMedium">{value}</AppText>
      {hint ? (
        <AppText variant="caption" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.tertiary },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    elevation: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.medium,
    marginTop: spacing.sm,
  },
  sheetContent: { padding: spacing.xl, gap: spacing.md },
  headRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  metrics: { flexDirection: "row", gap: spacing.sm },
  metric: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
    gap: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  muted: { color: "#64748B" },
  hint: { color: "#64748B" },
  warn: { color: "#B45309" },
  refresh: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    minHeight: 44,
  },
  refreshText: { color: colors.primary[700], fontWeight: "700" },
});
