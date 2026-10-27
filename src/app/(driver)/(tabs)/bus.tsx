import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { BusResponse } from "@/features/passenger/passenger.types";
import { useDriverProfile } from "@/features/profile/useDriverProfile";
import { parseServerTime } from "@/features/tracking/tracking.logic";
import { useAppSelector } from "@/store/hooks";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

const pretty = (v?: string | null) =>
  v
    ? v
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;
const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * No "my bus" endpoint exists, so the vehicle = bus on the active (else next)
 * trip; details from GET /api/v1/buses/{id} (read-only). Live readouts use
 * real values only: GPS fix speed, trip occupancy, driver duty status.
 * (No SOS/incident endpoint exists on the backend, so no SOS button.)
 */
export default function DriverBus() {
  const s = useDriverSession();
  const router = useRouter();
  const userId = useAppSelector((st) => st.auth.user?.id);
  const duty = useDriverProfile(userId, true);
  const trip = s.activeTrip ?? s.nextTrip;
  const [bus, setBus] = useState<BusResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!trip?.busId) {
      setBus(null);
      return;
    }
    let cancelled = false;
    setFailed(false);
    passengerApi
      .getBusById(trip.busId)
      .then((b) => !cancelled && setBus(b))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [trip?.busId]);

  const today = useMemo(() => {
    const day = localDay(new Date());
    return s.trips
      .filter((t) => t.scheduledStartTime?.startsWith(day))
      .sort(
        (a, b) =>
          (parseServerTime(a.scheduledStartTime) ?? 0) -
          (parseServerTime(b.scheduledStartTime) ?? 0),
      );
  }, [s.trips]);

  const running = !!s.activeTrip;
  const speedMs = s.gps.lastFix?.coords.speed;
  const speed =
    running && speedMs != null && speedMs >= 0
      ? `${Math.round(speedMs * 3.6)} km/h`
      : "--";
  const online = s.gps.connection === "connected";

  const details: [string, string | null][] = bus
    ? [
        ["Registration", bus.registrationNumber],
        ["Type", pretty(bus.busType)],
        ["Seats", bus.capacity ? String(bus.capacity) : null],
        [
          "Model",
          [bus.manufacturer, bus.model].filter(Boolean).join(" ") || null,
        ],
        ["Fuel", pretty(bus.fuelType)],
        ["Year", bus.yearOfManufacture ? String(bus.yearOfManufacture) : null],
        ["Vehicle status", pretty(bus.status)],
      ]
    : [];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={s.refreshing}
            onRefresh={async () => {
              await s.refresh();
              await duty.reload();
            }}
          />
        }
      >
        <AppText variant="h1">My bus</AppText>
        {s.loading ? (
          <Skeleton height={180} radius={20} />
        ) : !trip ? (
          <EmptyState
            icon="bus-outline"
            title="No bus assigned"
            message="Your bus appears here once a trip is assigned to you."
          />
        ) : (
          <>
            <View style={styles.hero}>
              <View style={{ flex: 1 }}>
                <AppText variant="h1" style={{ color: "#FFF" }}>
                  {trip.busNumber}
                </AppText>
                <AppText variant="caption" style={{ color: "#CBD5E1" }}>
                  {trip.registrationNumber}
                </AppText>
              </View>
              <View
                style={[
                  styles.online,
                  {
                    backgroundColor: running
                      ? online
                        ? "#D1FAE5"
                        : "#FEF3C7"
                      : "#334155",
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: running
                        ? online
                          ? "#047857"
                          : "#B45309"
                        : "#94A3B8",
                    },
                  ]}
                />
                <AppText
                  variant="caption"
                  style={{
                    color: running
                      ? online
                        ? "#047857"
                        : "#B45309"
                      : "#CBD5E1",
                    fontWeight: "700",
                  }}
                >
                  {running ? (online ? "Online" : "Connection issue") : "Idle"}
                </AppText>
              </View>
            </View>

            <View style={styles.stats}>
              <Stat icon="speedometer-outline" label="Speed" value={speed} />
              <Stat
                icon="people-outline"
                label="Seats taken"
                value={`${trip.currentOccupancy}/${trip.totalSeats}`}
              />
              <Stat
                icon="pulse-outline"
                label="Duty"
                value={pretty(duty.driver?.status) ?? "--"}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <AppText variant="bodyMedium" style={{ flex: 1 }}>
                  {trip.routeCode} · {trip.routeName}
                </AppText>
                <StatusBadge status={trip.status} />
              </View>
              <AnimatedButton
                title={running ? "Continue active trip" : "Open trip"}
                onPress={() => router.push("/(driver)/(tabs)/trip")}
              />
            </View>

            <AppText variant="h3">Today's trips</AppText>
            {today.length === 0 ? (
              <AppText variant="caption" style={styles.muted}>
                No trips scheduled for today.
              </AppText>
            ) : (
              <View style={styles.card}>
                {today.map((t, i) => {
                  const ms = parseServerTime(t.scheduledStartTime);
                  return (
                    <View
                      key={t.id}
                      style={[styles.row, i > 0 && styles.rowBorder]}
                    >
                      <AppText variant="bodyMedium" style={{ width: 70 }}>
                        {ms === null ? "--" : formatTime(new Date(ms))}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={[styles.muted, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {t.routeCode} · {t.routeName}
                      </AppText>
                      <StatusBadge status={t.status} />
                    </View>
                  );
                })}
              </View>
            )}

            <AppText variant="h3">Vehicle details</AppText>
            {failed ? (
              <AppText variant="caption" style={styles.muted}>
                Couldn't load vehicle details. Pull down to retry.
              </AppText>
            ) : !bus ? (
              <Skeleton height={140} radius={16} />
            ) : (
              <View style={styles.card}>
                {details
                  .filter(([, v]) => v)
                  .map(([k, v], i) => (
                    <View
                      key={k}
                      style={[styles.row, i > 0 && styles.rowBorder]}
                    >
                      <AppText variant="caption" style={styles.muted}>
                        {k}
                      </AppText>
                      <AppText variant="caption" style={styles.value}>
                        {v}
                      </AppText>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Ionicons name={icon} size={20} color={colors.primary[700]} />
      <AppText variant="bodyMedium">{value}</AppText>
      <AppText variant="caption" style={styles.muted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: "#0F172A",
    gap: spacing.md,
  },
  online: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stats: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  muted: { color: "#64748B" },
  value: {
    color: "#0F172A",
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});
