import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { parseServerTime } from "@/features/tracking/tracking.logic";
import { colors, radius, spacing } from "@/theme";
import { formatTime } from "@/utils/date";
import { Alert, StyleSheet, View } from "react-native";
import { useDriverSession } from "../DriverSessionProvider";
import type { DriverTripResponse } from "../driver.types";

const clock = (v: string | null) => {
  const ms = parseServerTime(v);
  return ms === null ? "--" : formatTime(new Date(ms));
};

/** Assigned-trip card with only the actions the backend permits for its status. */
export function DriverTripCard({ trip }: { trip: DriverTripResponse }) {
  const { busy, activeTrip, startTrip, completeTrip, cancelTrip } =
    useDriverSession();
  const mine = busy?.tripId === trip.id ? busy.action : null;
  const anyBusy = busy !== null;

  const canStart =
    (trip.status === "SCHEDULED" || trip.status === "BOARDING") &&
    (!activeTrip || activeTrip.id === trip.id);
  const canComplete = trip.status === "IN_PROGRESS";
  const canCancel =
    trip.status === "SCHEDULED" ||
    trip.status === "BOARDING" ||
    trip.status === "IN_PROGRESS";

  const confirm = (
    title: string,
    message: string,
    ok: string,
    fn: () => void,
  ) =>
    Alert.alert(title, message, [
      { text: "Not now", style: "cancel" },
      { text: ok, style: "destructive", onPress: fn },
    ]);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{trip.busNumber}</AppText>
          <AppText variant="caption" style={styles.muted}>
            {trip.registrationNumber}
          </AppText>
        </View>
        <StatusBadge status={trip.status} />
      </View>
      <AppText variant="bodyMedium">
        {trip.routeCode} · {trip.routeName}
      </AppText>
      <View style={styles.times}>
        <AppText variant="caption" style={styles.muted}>
          Scheduled {clock(trip.scheduledStartTime)} –{" "}
          {clock(trip.scheduledEndTime)}
        </AppText>
        {trip.actualStartTime && (
          <AppText variant="caption" style={styles.muted}>
            Started {clock(trip.actualStartTime)}
          </AppText>
        )}
        <AppText variant="caption" style={styles.muted}>
          Seats: {trip.currentOccupancy}/{trip.totalSeats} occupied
        </AppText>
      </View>

      {canStart && (
        <AnimatedButton
          title={
            trip.status === "BOARDING" ? "Start trip (boarding)" : "Start trip"
          }
          loading={mine === "start"}
          disabled={anyBusy && mine !== "start"}
          onPress={() => void startTrip(trip.id)}
          accessibilityHint="Starts the trip and begins sharing your live location"
        />
      )}
      {canComplete && (
        <AnimatedButton
          title="Complete trip"
          loading={mine === "complete"}
          disabled={anyBusy && mine !== "complete"}
          onPress={() =>
            confirm(
              "Complete this trip?",
              "Location sharing will stop.",
              "Complete",
              () => void completeTrip(trip.id),
            )
          }
        />
      )}
      {canCancel && (
        <AnimatedButton
          title="Cancel trip"
          variant="danger"
          loading={mine === "cancel"}
          disabled={anyBusy && mine !== "cancel"}
          onPress={() =>
            confirm(
              "Cancel this trip?",
              "Passengers will see it as cancelled. This can't be undone.",
              "Cancel trip",
              () => void cancelTrip(trip.id),
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.md,
  },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  times: { gap: 2 },
  muted: { color: "#64748B" },
});
