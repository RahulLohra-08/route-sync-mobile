import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { BusResponse } from "@/features/passenger/passenger.types";
import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

const pretty = (v?: string | null) =>
  v
    ? v
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;

/**
 * There is no "my bus" endpoint, so the assigned vehicle is the bus on the
 * driver's active (else next) trip; vehicle details: GET /api/v1/buses/{id}
 * (allowed for DRIVER, read-only). No bus-management actions here.
 */
export default function DriverBus() {
  const s = useDriverSession();
  const router = useRouter();
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

  const rows: [string, string | null][] = bus
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
          <RefreshControl refreshing={s.refreshing} onRefresh={s.refresh} />
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
              <AppText variant="h1" style={styles.heroNum}>
                {trip.busNumber}
              </AppText>
              <AppText variant="caption" style={styles.heroSub}>
                {trip.registrationNumber}
              </AppText>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <AppText variant="bodyMedium" style={{ flex: 1 }}>
                  {trip.routeCode} · {trip.routeName}
                </AppText>
                <StatusBadge status={trip.status} />
              </View>
              <AppText variant="caption" style={styles.muted}>
                Trip ID {trip.id.slice(0, 8)}
              </AppText>
              <AnimatedButton
                title={s.activeTrip ? "Continue active trip" : "Open trip"}
                onPress={() => router.push("/(driver)/(tabs)/trip")}
              />
            </View>

            <AppText variant="h3">Vehicle details</AppText>
            {failed ? (
              <AppText variant="caption" style={styles.muted}>
                Couldn't load vehicle details. Pull down to retry.
              </AppText>
            ) : !bus ? (
              <Skeleton height={140} radius={16} />
            ) : (
              <View style={styles.card}>
                {rows
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <View key={k} style={styles.row}>
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

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  hero: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: "#0F172A",
    gap: 2,
  },
  heroNum: { color: "#FFFFFF" },
  heroSub: { color: "#CBD5E1" },
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
  muted: { color: "#64748B" },
  value: {
    color: "#0F172A",
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});
