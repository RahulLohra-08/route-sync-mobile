import { useEffect, useMemo, useState } from "react";

import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import MapView, { Marker, Region } from "react-native-maps";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { StatusBadge } from "@/components/common/StatusBadge";

import { driverApi } from "@/features/driver/driver.api";

import type { DriverTripResponse } from "@/features/driver/driver.types";

import { TripStatus } from "@/features/passenger/passenger.enums";

import { useDriverLocationBroadcaster } from "@/features/tracking/hooks/useDriverLocationBroadcaster";

import { colors, spacing } from "@/theme";

const DEFAULT_REGION: Region = {
  latitude: 23.3441,

  longitude: 85.3096,

  latitudeDelta: 0.08,

  longitudeDelta: 0.08,
};

export default function DriverTripScreen() {
  const [trips, setTrips] = useState<DriverTripResponse[]>([]);

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) ?? null,
    [trips, selectedTripId],
  );

  const isTracking = selectedTrip?.status === TripStatus.IN_PROGRESS;

  const { isBroadcasting, lastSentAt, lastTransport, lastError, lastLocation } =
    useDriverLocationBroadcaster({
      tripId: selectedTripId,
      enabled: isTracking,
    });

  // =========================================================
  // LOAD DRIVER TRIPS
  // =========================================================

  const loadTrips = async () => {
    try {
      setLoading(true);

      setError(null);

      const data = await driverApi.getMyTrips();

      setTrips(data);

      /*
       * Agar already running trip hai to
       * automatically select karenge.
       */
      const activeTrip = data.find(
        (trip) => trip.status === TripStatus.IN_PROGRESS,
      );

      const firstUsableTrip =
        activeTrip ??
        data.find(
          (trip) =>
            trip.status === TripStatus.SCHEDULED ||
            trip.status === TripStatus.BOARDING,
        );

      if (firstUsableTrip) {
        setSelectedTripId(firstUsableTrip.id);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load driver trips",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // =========================================================
  // START TRIP
  // =========================================================

  const handleStartTrip = async () => {
    if (!selectedTripId) {
      return;
    }

    try {
      const updated = await driverApi.startTrip(selectedTripId);

      setTrips((current) =>
        current.map((trip) => (trip.id === updated.id ? updated : trip)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to start trip",
      );
    }
  };

  // =========================================================
  // COMPLETE TRIP
  // =========================================================

  const handleCompleteTrip = async () => {
    if (!selectedTripId) {
      return;
    }

    try {
      const updated = await driverApi.completeTrip(selectedTripId);

      setTrips((current) =>
        current.map((trip) => (trip.id === updated.id ? updated : trip)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete trip",
      );
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />

          <AppText>Loading trips...</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="h1" style={styles.title}>
        Driver Trip
      </AppText>

      {error && <AppText style={styles.error}>{error}</AppText>}

      {trips.length === 0 ? (
        <View style={styles.center}>
          <AppText>No assigned trips found.</AppText>
        </View>
      ) : (
        <>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.tripCard,
                  item.id === selectedTripId && styles.selectedCard,
                ]}
              >
                <AppText variant="h2">{item.busNumber}</AppText>

                <AppText>{item.routeCode}</AppText>

                <AppText>{item.routeName}</AppText>

                <StatusBadge status={item.status} />

                <AnimatedButton
                  title={
                    item.id === selectedTripId ? "Selected" : "Select Trip"
                  }
                  onPress={() => setSelectedTripId(item.id)}
                  style={styles.selectButton}
                />
              </View>
            )}
          />

          {selectedTrip && (
            <View style={styles.content}>
              <View style={styles.infoCard}>
                <AppText variant="h2">{selectedTrip.busNumber}</AppText>

                <AppText>{selectedTrip.routeName}</AppText>

                <AppText>Status: {selectedTrip.status}</AppText>

                {selectedTrip.status === TripStatus.SCHEDULED ||
                selectedTrip.status === TripStatus.BOARDING ? (
                  <AnimatedButton
                    title="Start Trip"
                    onPress={handleStartTrip}
                  />
                ) : null}

                {selectedTrip.status === TripStatus.IN_PROGRESS && (
                  <AnimatedButton
                    title="Complete Trip"
                    onPress={handleCompleteTrip}
                  />
                )}
              </View>

              <View style={styles.liveCard}>
                <AppText variant="h2">GPS Broadcasting</AppText>

                <AppText>{isBroadcasting ? "LIVE" : "NOT ACTIVE"}</AppText>

                <AppText>Transport: {lastTransport ?? "Waiting"}</AppText>

                <AppText>
                  Last sent:{" "}
                  {lastSentAt ? lastSentAt.toLocaleTimeString() : "Never"}
                </AppText>

                {lastError && (
                  <AppText style={styles.error}>{lastError}</AppText>
                )}
              </View>

              <View style={styles.mapWrapper}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  initialRegion={
                    lastLocation
                      ? {
                          latitude: lastLocation.coords.latitude,

                          longitude: lastLocation.coords.longitude,

                          latitudeDelta: 0.02,

                          longitudeDelta: 0.02,
                        }
                      : DEFAULT_REGION
                  }
                >
                  {lastLocation && (
                    <Marker
                      coordinate={{
                        latitude: lastLocation.coords.latitude,

                        longitude: lastLocation.coords.longitude,
                      }}
                      title="Your current location"
                    />
                  )}
                </MapView>
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  error: {
    color: colors.status.error,
    marginBottom: spacing.sm,
  },

  tripList: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },

  tripCard: {
    width: 220,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    gap: spacing.xs,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: colors.map.bus,
  },

  selectButton: {
    marginTop: spacing.sm,
  },

  content: {
    flex: 1,
    gap: spacing.md,
  },

  infoCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    gap: spacing.sm,
  },

  liveCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    gap: spacing.xs,
  },

  mapWrapper: {
    flex: 1,
    minHeight: 260,
    borderRadius: 16,
    overflow: "hidden",
  },
});
