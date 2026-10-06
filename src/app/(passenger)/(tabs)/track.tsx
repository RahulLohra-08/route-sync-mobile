import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { colors, spacing } from "@/theme";

import { LiveBusMap } from "@/features/tracking/components/LiveBusMap";
import { useTripTracking } from "@/features/tracking/hooks/useTripTracking";
import { useAppSelector } from "@/store/hooks";

/**
 * Persistent "Track" tab: shows whichever trip the passenger most
 * recently opened from a bus/trip card (see bus/[id].tsx, which
 * writes to tracking.slice's selectedTripId). This lets a passenger
 * switch to Home/Trips and back without losing their live view or
 * opening a second subscription to the same trip.
 */
export default function Track() {
  const router = useRouter();
  const selectedTripId = useAppSelector(
    (state) => state.tracking.selectedTripId,
  );

  const { status } = useTripTracking({
    tripId: selectedTripId,
    enabled: !!selectedTripId,
  });

  const liveLocation = useAppSelector((state) =>
    selectedTripId
      ? (state.tracking.locationsByTripId[selectedTripId] ?? null)
      : null,
  );

  if (!selectedTripId) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Ionicons
            name="location-outline"
            size={40}
            color={colors.text.muted}
          />

          <AppText variant="h2" style={styles.emptyTitle}>
            No bus selected
          </AppText>

          <AppText variant="body" style={styles.emptyBody}>
            Open a trip from the Trips tab to start tracking it live here.
          </AppText>

          <AnimatedButton
            title="Browse trips"
            onPress={() => router.push("/(passenger)/(tabs)/trips")}
            style={styles.emptyButton}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="h1" style={styles.title}>
        Live Tracking
      </AppText>

      <View style={styles.mapWrapper}>
        <LiveBusMap location={liveLocation} status={status} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },

  mapWrapper: {
    flex: 1,
    marginBottom: spacing.lg,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },

  emptyTitle: {
    marginTop: spacing.sm,
  },

  emptyBody: {
    textAlign: "center",
    color: colors.text.secondary,
  },

  emptyButton: {
    marginTop: spacing.lg,
  },
});
