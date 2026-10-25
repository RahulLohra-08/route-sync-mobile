import AnimatedButton from "@/components/common/AnimatedButton";
import Screen from "@/components/common/Screen";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TripTrackingView } from "@/features/tracking/components/TripTrackingView";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

/**
 * "Track" tab: follows the trip the passenger last opened (stored in
 * tracking.slice.selectedTripId) so switching tabs never drops the live view.
 */
export default function Track() {
  const router = useRouter();
  const tripId = useAppSelector((s) => s.tracking.selectedTripId);

  if (!tripId) {
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState
            icon="location-outline"
            title="No bus selected"
            message="Pick a trip to see exactly where its bus is, live on the map."
          />
          <AnimatedButton
            title="Browse trips"
            onPress={() => router.push("/(passenger)/(tabs)/trips")}
          />
        </View>
      </Screen>
    );
  }
  return <TripTrackingView tripId={tripId} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", gap: 8 },
});
