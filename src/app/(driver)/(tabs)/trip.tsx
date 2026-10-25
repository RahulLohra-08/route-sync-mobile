import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { DriverTripCard } from "@/features/driver/components/DriverTripCard";
import { GpsStatusCard } from "@/features/driver/components/GpsStatusCard";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { StopResponse } from "@/features/passenger/passenger.types";
import { useNow } from "@/hooks/useNow";
import { colors, radius, spacing } from "@/theme";
import { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

/** Active (or next) trip in detail: GPS health, own position, route stops, queue. */
export default function DriverTrip() {
  const s = useDriverSession();
  const now = useNow(5_000);
  const trip = s.activeTrip ?? s.nextTrip;
  const [stops, setStops] = useState<StopResponse[] | null>(null);

  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    // GET /api/v1/routes/{id}/stops/active is open to any authenticated role.
    passengerApi
      .getRouteStops(trip.routeId)
      .then(
        (d) =>
          !cancelled &&
          setStops([...d].sort((a, b) => a.stopOrder - b.stopOrder)),
      )
      .catch(() => !cancelled && setStops([]));
    return () => {
      cancelled = true;
    };
  }, [trip?.routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fix = s.gps.lastFix;
  const others = s.upcoming.filter((t) => t.id !== trip?.id);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={s.refreshing} onRefresh={s.refresh} />
        }
      >
        <AppText variant="h1">Trip</AppText>
        {!trip ? (
          <EmptyState
            icon="bus-outline"
            title="No active or upcoming trip"
            message="Trips assigned to you will appear here."
          />
        ) : (
          <>
            <DriverTripCard trip={trip} />
            {s.actionError && (
              <AppText
                variant="bodyMedium"
                style={styles.error}
                accessibilityRole="alert"
              >
                {s.actionError}
              </AppText>
            )}
            <GpsStatusCard
              gps={s.gps}
              tripRunning={!!s.activeTrip}
              now={now.getTime()}
            />

            {s.activeTrip && (
              <View style={styles.map}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  region={
                    fix
                      ? {
                          latitude: fix.coords.latitude,
                          longitude: fix.coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }
                      : undefined
                  }
                  initialRegion={{
                    latitude: 22.9734,
                    longitude: 78.6569,
                    latitudeDelta: 12,
                    longitudeDelta: 12,
                  }}
                >
                  {fix && (
                    <Marker
                      coordinate={{
                        latitude: fix.coords.latitude,
                        longitude: fix.coords.longitude,
                      }}
                      title="Your position"
                    />
                  )}
                </MapView>
                {!fix && (
                  <View style={styles.mapNote}>
                    <AppText variant="caption">
                      Waiting for your first GPS fix...
                    </AppText>
                  </View>
                )}
              </View>
            )}

            <AppText variant="h3">Route stops</AppText>
            {stops === null ? (
              <AppText variant="caption" style={styles.muted}>
                Loading stops...
              </AppText>
            ) : stops.length === 0 ? (
              <AppText variant="caption" style={styles.muted}>
                No stops published for this route.
              </AppText>
            ) : (
              stops.map((st) => (
                <View key={st.id} style={styles.stop}>
                  <View style={styles.dot}>
                    <AppText variant="caption" style={styles.dotText}>
                      {st.stopOrder}
                    </AppText>
                  </View>
                  <AppText variant="bodyMedium" style={{ flex: 1 }}>
                    {st.stopName}
                  </AppText>
                </View>
              ))
            )}

            {others.length > 0 && (
              <>
                <AppText variant="h3">Later trips</AppText>
                {others.map((t) => (
                  <DriverTripCard key={t.id} trip={t} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  error: { color: colors.status.error },
  muted: { color: "#64748B" },
  map: {
    height: 220,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.background.tertiary,
  },
  mapNote: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  stop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: colors.primary[700], fontWeight: "700" },
});
