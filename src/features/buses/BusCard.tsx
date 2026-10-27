import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import { parseServerTime } from "@/features/tracking/tracking.logic";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";
import { STATE_META, type BusEntry } from "./busStatus";

const pretty = (v: string | null | undefined) =>
  v
    ? v
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;

/** Compact bus card; expands for vehicle details. Track CTA only with a real trip. */
export const BusCard = memo(function BusCard({
  entry,
  onTrack,
}: {
  entry: BusEntry;
  onTrack: (tripId: string) => void;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { bus, trip, route, state } = entry;
  const meta = STATE_META[state];
  const lastMs = parseServerTime(bus.lastLocationUpdate);
  const canTrack = !!trip;

  return (
    <Animated.View
      layout={reduce ? undefined : LinearTransition.duration(250)}
      style={styles.card}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Bus ${bus.busNumber}, ${meta.label}. ${open ? "Collapse" : "Expand"} details`}
        style={styles.head}
      >
        <View style={[styles.icon, { backgroundColor: meta.bg }]}>
          <Ionicons name="bus" size={20} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium">{bus.busNumber}</AppText>
          <AppText variant="caption" style={styles.muted}>
            {bus.registrationNumber}
          </AppText>
        </View>
        <View style={[styles.pill, { backgroundColor: meta.bg }]}>
          <AppText
            variant="caption"
            style={{ color: meta.color, fontWeight: "700" }}
          >
            {meta.label}
          </AppText>
        </View>
      </Pressable>

      {trip?.driverName ? (
        <View
          style={styles.driver}
          accessible
          accessibilityLabel={`Driver ${trip.driverName}`}
        >
          <Ionicons name="person-circle-outline" size={16} color="#64748B" />
          <AppText variant="caption" style={styles.muted}>
            Driver: {trip.driverName}
          </AppText>
        </View>
      ) : null}

      {route && trip ? (
        <View style={styles.route}>
          <AppText variant="caption" style={styles.routeCode}>
            {route.routeCode}
          </AppText>
          <AppText variant="caption" style={styles.routeText} numberOfLines={1}>
            {route.startLocation} → {route.endLocation}
          </AppText>
        </View>
      ) : (
        <AppText variant="caption" style={styles.muted}>
          {state === "maintenance" || state === "inactive"
            ? "Not available for service."
            : "No route assigned right now."}
        </AppText>
      )}

      {open && (
        <View style={styles.details}>
          <Detail label="Type" value={pretty(bus.busType)} />
          <Detail
            label="Seats"
            value={bus.capacity ? String(bus.capacity) : null}
          />
          <Detail
            label="Model"
            value={
              [bus.manufacturer, bus.model].filter(Boolean).join(" ") || null
            }
          />
          <Detail label="Fuel" value={pretty(bus.fuelType)} />
          <Detail
            label="Year"
            value={bus.yearOfManufacture ? String(bus.yearOfManufacture) : null}
          />
          {state !== "live" && lastMs !== null && (
            <Detail
              label="Last known position"
              value={`updated ${new Date(lastMs).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${formatTime(new Date(lastMs))}`}
            />
          )}
        </View>
      )}

      {canTrack && (
        <AnimatedButton
          title={state === "live" ? "Track live" : "View trip"}
          onPress={() => onTrack(trip!.id)}
          style={styles.cta}
          accessibilityHint="Opens the trip map and route stops"
        />
      )}
    </Animated.View>
  );
});

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null; // hide missing fields instead of showing blanks
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" style={styles.muted}>
        {label}
      </AppText>
      <AppText variant="caption" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  driver: { flexDirection: "row", alignItems: "center", gap: 6 },
  route: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  routeCode: {
    color: colors.primary[700],
    fontWeight: "700",
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  routeText: { flex: 1, color: "#0F172A" },
  details: {
    gap: 6,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  value: {
    color: "#0F172A",
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  muted: { color: "#64748B" },
  cta: { minHeight: 46 },
});
