import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import type {
    RouteResponse,
    TripResponse,
} from "@/features/passenger/passenger.types";
import { palette, raised } from "@/theme/passenger";
import {
    formatDayLabel,
    formatTime,
    getTripEta,
    getTripProgress,
    parseLocal,
} from "@/utils/date";
import { PressableScale } from "../common/PressableScale";

interface Props {
  trip: TripResponse;
  route?: RouteResponse;
  now: Date;
  onPress?: () => void;
}

const WHITE_60 = "rgba(255,255,255,0.6)";

/**
 * The dashboard's hero: a boarding-pass style card for the one bus the
 * passenger most likely wants. The countdown is the only amber text on screen.
 */
export function ETACard({ trip, route, now, onPress }: Props) {
  const eta = getTripEta(trip, now);
  const live = trip.status === "IN_PROGRESS";
  const start = parseLocal(trip.scheduledStartTime);
  const end = parseLocal(trip.scheduledEndTime);
  const seatsLeft =
    trip.availableSeats ?? Math.max(0, trip.totalSeats - trip.currentOccupancy);

  const kicker = live
    ? "Your bus is on the way"
    : trip.status === "BOARDING"
      ? "Now boarding"
      : "Next departure";

  return (
    <Animated.View
      entering={FadeInDown.delay(120).springify().damping(15).stiffness(120)}
    >
      <PressableScale
        onPress={onPress}
        scaleTo={0.985}
        style={[styles.card, raised]}
      >
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{kicker}</Text>
            <Text style={styles.route} numberOfLines={2}>
              {trip.routeName}
            </Text>
          </View>
          <StatusBadge status={trip.status} />
        </View>

        <View style={styles.etaBlock}>
          <View style={styles.etaRow}>
            <Text
              style={styles.etaValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {eta.value}
            </Text>
            {eta.unit ? <Text style={styles.etaUnit}>{eta.unit}</Text> : null}
          </View>
          <Text style={styles.etaCaption}>{eta.caption}</Text>
        </View>

        {live && (
          <View style={styles.progressWrap}>
            <ProgressBar
              value={getTripProgress(trip, now)}
              color={palette.amber}
              trackColor="rgba(255,255,255,0.16)"
              height={5}
              thumb={
                <View style={styles.thumb}>
                  <Ionicons name="bus" size={15} color={palette.ink} />
                </View>
              }
            />
            <View style={styles.progressLabels}>
              <Text style={styles.small} numberOfLines={1}>
                {route?.startLocation ?? "Start"}
              </Text>
              <Text style={styles.small} numberOfLines={1}>
                {route?.endLocation ?? "End"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.times}>
          <Fact
            label="Departs"
            value={formatTime(start)}
            sub={formatDayLabel(start, now)}
          />
          <Fact
            label="Arrives"
            value={formatTime(end)}
            sub={formatDayLabel(end, now)}
            align="right"
          />
        </View>

        {/* Ticket perforation */}
        <View style={styles.perforation}>
          <View style={[styles.notch, { marginLeft: -12 }]} />
          <View style={styles.dash} />
          <View style={[styles.notch, { marginRight: -12 }]} />
        </View>

        <View style={styles.footer}>
          <Fact label="Bus" value={trip.busNumber} />
          <Fact label="Driver" value={trip.driverName} flex />
          <Fact
            label="Seats left"
            value={seatsLeft > 0 ? String(seatsLeft) : "Full"}
            align="right"
          />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

function Fact({
  label,
  value,
  sub,
  align = "left",
  flex,
}: {
  label: string;
  value: string;
  sub?: string;
  align?: "left" | "right";
  flex?: boolean;
}) {
  return (
    <View
      style={[
        { alignItems: align === "right" ? "flex-end" : "flex-start" },
        flex && { flex: 1, paddingHorizontal: 12 },
      ]}
    >
      <Text style={styles.small}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
      {sub ? <Text style={styles.small}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.inkSoft,
    borderRadius: 26,
    padding: 20,
    overflow: "hidden",
  },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  kicker: { fontSize: 13, color: WHITE_60, fontWeight: "600" },
  route: {
    fontSize: 21,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  etaBlock: { marginTop: 18 },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  etaValue: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: "800",
    color: palette.amber,
    letterSpacing: -2,
  },
  etaUnit: { fontSize: 20, fontWeight: "700", color: palette.amber },
  etaCaption: { fontSize: 14, color: WHITE_60, marginTop: 2 },
  progressWrap: { marginTop: 22 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.amber,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: palette.inkSoft,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  perforation: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    marginHorizontal: -20,
  },
  notch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.bg,
  },
  dash: {
    flex: 1,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: palette.inkLine,
    marginHorizontal: 8,
  },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  small: { fontSize: 12, color: WHITE_60, fontWeight: "500" },
  factValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 1,
  },
});
