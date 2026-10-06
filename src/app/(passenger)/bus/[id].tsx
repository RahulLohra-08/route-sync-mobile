import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/common/AppText";
import Loading from "@/components/common/Loading";
import { PressableScale } from "@/components/common/PressableScale";
import Screen from "@/components/common/Screen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { colors, spacing } from "@/theme";

import { passengerApi } from "@/features/passenger/passenger.api";
import type { TripResponse } from "@/features/passenger/passenger.types";
import { LiveBusMap } from "@/features/tracking/components/LiveBusMap";
import { useTripTracking } from "@/features/tracking/hooks/useTripTracking";
import { setSelectedTrip } from "@/features/tracking/tracking.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * Live tracking screen for a single trip/bus.
 *
 * NOTE ON THE ROUTE PARAM: this screen is reached as
 * "/(passenger)/bus/[id]" and the id is treated here as a *tripId*,
 * not a busId. Live GPS is fundamentally a property of a Trip in this
 * backend (TripLocationWebSocketMessage, /topic/trips/{tripId}/location,
 * TripLocationService), not of a Bus in isolation - a bus with no
 * active trip has no live feed to show. If your navigation actually
 * passes a busId here, either change the callers to pass the trip's
 * id instead (it's already present on every TripResponse/BusResponse
 * card), or add a "find the active trip for this bus" backend lookup
 * and swap the fetch below for it.
 */
export default function BusPage() {
  const { id: tripId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    let cancelled = false;

    passengerApi
      .getTripById(tripId)
      .then((data) => {
        if (!cancelled) setTrip(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load this trip.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Remember this as the passenger's followed trip so the "Track"
    // tab shows the same bus if they switch tabs.
    dispatch(setSelectedTrip(tripId));

    return () => {
      cancelled = true;
    };
  }, [tripId, dispatch]);

  const handleLocationUpdate = useCallback(() => {
    // Redux already holds the latest point (see useTripTracking);
    // nothing extra needed here today. Kept as an extension point for
    // e.g. triggering a "bus is arriving" local notification later.
  }, []);

  const { status } = useTripTracking({
    tripId,
    enabled: !!tripId,
    onLocationUpdate: handleLocationUpdate,
  });

  const liveLocation = useAppSelector((state) =>
    tripId ? (state.tracking.locationsByTripId[tripId] ?? null) : null,
  );

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (loadError || !trip) {
    return (
      <Screen>
        <AppText variant="body">{loadError ?? "Trip not found."}</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </PressableScale>

        <View style={styles.headerText}>
          <AppText variant="h2">{trip.busNumber}</AppText>
          <AppText variant="caption" style={{ color: colors.text.secondary }}>
            {trip.routeName} ({trip.routeCode})
          </AppText>
        </View>

        <StatusBadge status={trip.status} />
      </View>

      <View style={styles.mapWrapper}>
        <LiveBusMap
          location={liveLocation}
          status={status}
          subtitle={`Driver: ${trip.driverName}`}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },

  backButton: {
    padding: spacing.xs,
  },

  headerText: {
    flex: 1,
  },

  mapWrapper: {
    flex: 1,
    marginBottom: spacing.lg,
  },
});
