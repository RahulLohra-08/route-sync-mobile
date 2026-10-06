import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { RouteResponse } from "@/features/passenger/passenger.types";
import { palette } from "@/theme/passenger";
import { formatDuration } from "@/utils/date";
import { PressableScale } from "../common/PressableScale";

interface Props {
  route: RouteResponse;
  onPress?: () => void;
}

export function RouteCard({ route, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.96} style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons name="navigate" size={16} color={palette.amber} />
        </View>
        <Text style={styles.code} numberOfLines={1}>
          {route.routeCode}
        </Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {route.routeName}
      </Text>

      <View style={styles.stops}>
        <View style={styles.rail}>
          <View style={styles.dotHollow} />
          <View style={styles.railLine} />
          <View style={styles.dotFilled} />
        </View>
        <View style={styles.stopNames}>
          <Text style={styles.stop} numberOfLines={1}>
            {route.startLocation}
          </Text>
          <Text style={styles.stop} numberOfLines={1}>
            {route.endLocation}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.chip}>
          <Ionicons name="speedometer-outline" size={13} color={palette.body} />
          <Text style={styles.chipText}>
            {route.distanceKm != null
              ? `${Math.round(route.distanceKm)} km`
              : "--"}
          </Text>
        </View>
        <View style={styles.chip}>
          <Ionicons name="time-outline" size={13} color={palette.body} />
          <Text style={styles.chipText}>
            {formatDuration(route.estimatedDurationMinutes)}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 232,
    backgroundColor: palette.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: palette.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  code: { flex: 1, fontSize: 12, fontWeight: "700", color: palette.muted },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.text,
    letterSpacing: -0.2,
    marginTop: 14,
    minHeight: 42,
  },
  stops: { flexDirection: "row", gap: 10, marginTop: 14, height: 54 },
  rail: { alignItems: "center", paddingVertical: 3 },
  railLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: palette.border,
    marginVertical: 3,
  },
  dotHollow: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  dotFilled: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.ink,
  },
  stopNames: { flex: 1, justifyContent: "space-between" },
  stop: { fontSize: 14, fontWeight: "600", color: palette.body },
  meta: { flexDirection: "row", gap: 8, marginTop: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: palette.body },
});
