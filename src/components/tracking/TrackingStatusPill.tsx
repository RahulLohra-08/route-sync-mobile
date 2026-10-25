import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { LiveDot } from "@/components/common/LiveDot";
import AppText from "@/components/common/AppText";
import { HEALTH_META } from "@/features/tracking/health-meta";
import type { TrackingHealth } from "@/features/tracking/tracking.types";
import { radius } from "@/theme";

/** Compact status chip: the same wording/colours on every tracking screen. */
export function TrackingStatusPill({ health }: { health: TrackingHealth }) {
  const meta = HEALTH_META[health];
  return (
    <View
      style={[styles.pill, { backgroundColor: meta.bg }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Tracking status: ${meta.label}. ${meta.detail}`}
    >
      {meta.pulse ? (
        <LiveDot color={meta.color} size={7} />
      ) : (
        <Ionicons name={meta.icon} size={14} color={meta.color} />
      )}
      <AppText variant="caption" style={[styles.label, { color: meta.color }]}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  label: { fontWeight: "700" },
});
