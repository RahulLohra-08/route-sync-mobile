import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeOut,
    LinearTransition,
} from "react-native-reanimated";

import { PressableScale } from "@/components/common/PressableScale";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import type {
    RouteResponse,
    TripResponse,
} from "@/features/passenger/passenger.types";
import { TRIP_STATUS_META, palette } from "@/theme/passenger";
import {
    formatDayLabel,
    formatDuration,
    formatTime,
    parseLocal,
} from "@/utils/date";

interface Props {
  trip: TripResponse;
  route?: RouteResponse;
  now?: Date;
  /** Position in the list, used to stagger the entrance. */
  index?: number;
  onPress?: () => void;
}

export function TripCard({
  trip,
  route,
  now = new Date(),
  index = 0,
  onPress,
}: Props) {
  const meta = TRIP_STATUS_META[trip.status] ?? TRIP_STATUS_META.SCHEDULED;
  const start = parseLocal(trip.scheduledStartTime);
  const end = parseLocal(trip.scheduledEndTime);
  const minutes =
    start && end
      ? Math.round((end.getTime() - start.getTime()) / 60_000)
      : null;

  const seatsLeft =
    trip.availableSeats ?? Math.max(0, trip.totalSeats - trip.currentOccupancy);
  const occupancy =
    trip.totalSeats > 0 ? trip.currentOccupancy / trip.totalSeats : 0;
  const seatColor =
    occupancy > 0.85
      ? palette.danger
      : occupancy > 0.6
        ? palette.warning
        : palette.live;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 6) * 70)
        .springify()
        .damping(18)}
      exiting={FadeOut.duration(140)}
      layout={LinearTransition.springify().damping(18)}
    >
      <PressableScale onPress={onPress} scaleTo={0.98} style={styles.card}>
        {/* The stripe colour mirrors the trip status. */}
        <View style={[styles.stripe, { backgroundColor: meta.color }]} />

        <View style={styles.body}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {trip.routeName}
              </Text>
              <View style={styles.subRow}>
                <Text style={styles.code}>{trip.routeCode}</Text>
                <Text style={styles.day}>{formatDayLabel(start, now)}</Text>
              </View>
            </View>
            <StatusBadge status={trip.status} />
          </View>

          <View style={styles.timeline}>
            <View style={styles.endpoint}>
              <Text style={styles.time}>{formatTime(start)}</Text>
              <Text style={styles.place} numberOfLines={1}>
                {route?.startLocation ?? "Departure"}
              </Text>
            </View>

            <View style={styles.track}>
              <View style={styles.dotHollow} />
              <View style={styles.line} />
              <View style={styles.duration}>
                <Ionicons name="time-outline" size={12} color={palette.body} />
                <Text style={styles.durationText}>
                  {formatDuration(minutes)}
                </Text>
              </View>
              <View style={styles.line} />
              <View style={styles.dotFilled} />
            </View>

            <View style={[styles.endpoint, { alignItems: "flex-end" }]}>
              <Text style={styles.time}>{formatTime(end)}</Text>
              <Text style={styles.place} numberOfLines={1}>
                {route?.endLocation ?? "Arrival"}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.busIcon}>
              <Ionicons name="bus-outline" size={18} color={palette.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bus}>{trip.busNumber}</Text>
              <Text style={styles.driver} numberOfLines={1}>
                {trip.driverName}
              </Text>
            </View>
            <View style={styles.seats}>
              <Text style={[styles.seatText, { color: seatColor }]}>
                {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}
              </Text>
              <ProgressBar
                value={occupancy}
                color={seatColor}
                height={5}
                style={{ width: 84, marginTop: 6 }}
              />
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  body: { paddingVertical: 16, paddingLeft: 21, paddingRight: 16 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.text,
    letterSpacing: -0.2,
  },
  subRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3 },
  code: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.body,
    backgroundColor: palette.bg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  day: { fontSize: 12, color: palette.muted, fontWeight: "600" },
  timeline: { flexDirection: "row", alignItems: "flex-start", marginTop: 16 },
  endpoint: { width: 92 },
  time: { fontSize: 17, fontWeight: "800", color: palette.text },
  place: { fontSize: 12, color: palette.muted, marginTop: 2 },
  track: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    paddingHorizontal: 4,
  },
  line: { flex: 1, height: 1.5, backgroundColor: palette.border },
  dotHollow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  dotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.ink,
  },
  duration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
  },
  durationText: { fontSize: 11, fontWeight: "700", color: palette.body },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  busIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.amberSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bus: { fontSize: 15, fontWeight: "800", color: palette.text },
  driver: { fontSize: 12, color: palette.muted, marginTop: 1 },
  seats: { alignItems: "flex-end" },
  seatText: { fontSize: 13, fontWeight: "700" },
});
