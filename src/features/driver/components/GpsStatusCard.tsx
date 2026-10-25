import { Ionicons } from "@expo/vector-icons";
import { Linking, StyleSheet, View } from "react-native";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import { formatAgo } from "@/features/tracking/tracking.logic";
import type { DriverLocationSharing } from "@/features/tracking/hooks/useDriverLocationBroadcaster";
import { colors, radius, spacing } from "@/theme";

const CONNECTION_LABEL = {
  idle: "Not connected",
  connecting: "Connecting...",
  connected: "Connected",
  reconnecting: "Reconnecting...",
  disconnected: "No connection (retrying)",
  error: "Connection failed",
} as const;

/**
 * Honest GPS panel. "Confirmed" moves only on a server ack / HTTP 2xx. A server
 * rejection stays on screen until a later confirmation clears it.
 */
export function GpsStatusCard({ gps, tripRunning, now }: { gps: DriverLocationSharing; tripRunning: boolean; now: number }) {
  let tone: "ok" | "warn" | "bad" | "idle" = "idle";
  let headline = "Location sharing is off";
  let detail = "It starts automatically when you start a trip.";

  if (tripRunning) {
    if (gps.permission === "denied" || gps.permission === "blocked" || gps.permission === "services-off") {
      tone = "bad"; headline = "Not sharing your location";
      detail = gps.permission === "services-off" ? "Device location is switched off." : "Location permission is missing.";
    } else if (gps.problem) {
      tone = "bad"; headline = "Server rejected your location"; detail = gps.problem;
    } else if (gps.phase === "starting" || gps.phase === "idle") {
      tone = "warn"; headline = "Starting GPS..."; detail = "Waiting for the first position.";
    } else if (gps.unconfirmed || gps.connection === "disconnected" || gps.connection === "error") {
      tone = "warn"; headline = "Sending, but not confirmed"; detail = "Passengers may see a delayed position.";
    } else if (gps.lastConfirmedAt) {
      tone = "ok"; headline = "Sharing live location"; detail = "Passengers can see your bus.";
    } else {
      tone = "warn"; headline = "Waiting for confirmation"; detail = "No server confirmation yet.";
    }
  }
  const color = { ok: colors.primary[700], warn: "#B45309", bad: colors.status.error, idle: "#475569" }[tone];
  const bg = { ok: colors.primary[50], warn: "#FEF3C7", bad: "#FEF2F2", idle: "#F1F5F9" }[tone];
  const icon = { ok: "navigate", warn: "time-outline", bad: "warning-outline", idle: "navigate-outline" }[tone] as "navigate";

  return (
    <View style={[styles.card, { backgroundColor: bg }]} accessible accessibilityLiveRegion="polite">
      <View style={styles.head}>
        <Ionicons name={icon} size={22} color={color} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" style={{ color }}>{headline}</AppText>
          <AppText variant="caption" style={{ color }}>{detail}</AppText>
        </View>
      </View>

      {tripRunning && (
        <View style={styles.rows}>
          <Row label="Connection" value={CONNECTION_LABEL[gps.connection]} />
          <Row label="Last confirmed" value={gps.lastConfirmedAt ? formatAgo(gps.lastConfirmedAt, now) : "Not yet"} />
          <Row label="Sent via" value={gps.lastTransport === "ws" ? "Live connection" : gps.lastTransport === "rest" ? "Backup (HTTP)" : "--"} />
        </View>
      )}

      {tripRunning && !gps.isForeground && (
        <AppText variant="caption" style={{ color: "#B45309" }}>
          RouteSync is in the background. Location sharing pauses until you reopen the app.
        </AppText>
      )}
      {tripRunning && (gps.permission === "denied" || gps.permission === "services-off") && (
        <AnimatedButton title="Allow location" variant="secondary" onPress={() => void gps.requestPermission()} />
      )}
      {tripRunning && gps.permission === "blocked" && (
        <AnimatedButton title="Open Settings" variant="secondary" onPress={() => void Linking.openSettings()} />
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.rowLabel}>{label}</AppText>
      <AppText variant="caption" style={styles.rowValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.xl, gap: spacing.md },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rows: { gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "#475569" },
  rowValue: { color: "#0F172A", fontWeight: "600" },
});
