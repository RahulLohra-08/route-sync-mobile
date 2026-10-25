import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import AppText from "@/components/common/AppText";
import { HEALTH_META } from "@/features/tracking/health-meta";
import type { TrackingHealth } from "@/features/tracking/tracking.types";
import { radius, spacing } from "@/theme";

/** Transport-level problems only; data freshness is shown by the status pill. */
const BANNER_STATES: TrackingHealth[] = ["reconnecting", "offline", "error"];

interface Props {
  health: TrackingHealth;
  /** Server/transport detail, e.g. "Your session has expired". */
  message?: string | null;
  onRetry?: () => void;
}

export function ConnectionBanner({ health, message, onRetry }: Props) {
  if (!BANNER_STATES.includes(health)) return null;
  const meta = HEALTH_META[health];
  const canRetry = (health === "error" || health === "offline") && !!onRetry;

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(150)}
      style={[styles.banner, { backgroundColor: meta.bg }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={meta.icon} size={18} color={meta.color} />
      <View style={styles.text}>
        <AppText variant="bodyMedium" style={{ color: meta.color }}>
          {meta.label}
        </AppText>
        <AppText variant="caption" style={{ color: meta.color }}>
          {message || meta.detail}
        </AppText>
      </View>
      {canRetry && (
        <Pressable
          onPress={onRetry}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Retry live tracking connection"
          style={[styles.retry, { borderColor: meta.color }]}
        >
          <AppText variant="caption" style={{ color: meta.color, fontWeight: "700" }}>
            Retry
          </AppText>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  text: { flex: 1 },
  retry: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: radius.pill,
  },
});
