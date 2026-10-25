import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { parseServerTime } from "@/features/tracking/tracking.logic";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

const when = (v: string | null) => {
  const ms = parseServerTime(v);
  if (ms === null) return "--";
  const d = new Date(ms);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${formatTime(d)}`;
};

/** Completed/cancelled trips from GET /api/v1/driver/trips (same list, filtered). */
export default function DriverHistory() {
  const s = useDriverSession();
  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: spacing.md }}>
        History
      </AppText>
      <FlatList
        data={s.history}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{
          gap: spacing.md,
          paddingBottom: spacing.xxxl,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={s.refreshing} onRefresh={s.refresh} />
        }
        ListEmptyComponent={
          s.loading ? null : (
            <EmptyState
              icon="time-outline"
              title="No past trips yet"
              message="Completed and cancelled trips will be listed here."
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <AppText variant="bodyMedium" style={{ flex: 1 }}>
                {item.busNumber} · {item.routeCode}
              </AppText>
              <StatusBadge status={item.status} />
            </View>
            <AppText variant="caption" style={styles.muted}>
              {item.routeName}
            </AppText>
            <AppText variant="caption" style={styles.muted}>
              {item.actualStartTime
                ? `Started ${when(item.actualStartTime)}`
                : `Scheduled ${when(item.scheduledStartTime)}`}
              {item.actualEndTime
                ? `  ·  Ended ${when(item.actualEndTime)}`
                : ""}
            </AppText>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  muted: { color: "#64748B" },
});
