import { TripCard } from "@/components/cards/TripCard";
import AppText from "@/components/common/AppText";
import Header from "@/components/common/Header";
import Screen from "@/components/common/Screen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { passengerApi } from "@/features/passenger/passenger.api";
import type {
  RouteResponse,
  StopResponse,
  TripResponse,
} from "@/features/passenger/passenger.types";
import { RouteStops } from "@/features/routes/RouteStops";
import { getApiErrorMessage } from "@/services/api/api-client";
import { colors, radius, spacing } from "@/theme";
import { formatDuration } from "@/utils/date";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

/** Route detail: GET /routes/{id}, /routes/{id}/stops/active, /passenger/trips/route/{id}. */
export default function RouteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [stops, setStops] = useState<StopResponse[]>([]);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [r, s, t] = await Promise.all([
        passengerApi.getRouteById(id),
        passengerApi.getRouteStops(id).catch(() => [] as StopResponse[]),
        passengerApi.getTripsByRoute(id).catch(() => [] as TripResponse[]),
      ]);
      setRoute(r);
      setStops([...s].sort((a, b) => a.stopOrder - b.stopOrder));
      setTrips(t);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load this route."));
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen scroll>
      <Header
        title={route?.routeName ?? "Route"}
        subtitle={route?.routeCode}
        showBack
        onBackPress={() => router.back()}
      />
      {loading ? (
        <View style={styles.gap}>
          <Skeleton height={80} radius={16} />
          <Skeleton height={200} radius={16} />
        </View>
      ) : error || !route ? (
        <ErrorState message={error ?? "Route not found."} onRetry={load} />
      ) : (
        <View style={styles.gap}>
          <View style={styles.card}>
            <AppText variant="bodyMedium">
              {route.startLocation} → {route.endLocation}
            </AppText>
            <AppText variant="caption" style={styles.muted}>
              {route.distanceKm != null
                ? `${route.distanceKm} km`
                : "Distance n/a"}{" "}
              · {formatDuration(route.estimatedDurationMinutes)}
            </AppText>
          </View>

          <AppText variant="h3">Stops</AppText>
          {stops.length === 0 ? (
            <AppText variant="caption" style={styles.muted}>
              No stops published for this route yet.
            </AppText>
          ) : (
            <RouteStops stops={stops} />
          )}

          <AppText variant="h3">Available trips</AppText>
          {trips.length === 0 ? (
            <AppText variant="caption" style={styles.muted}>
              No upcoming trips on this route.
            </AppText>
          ) : (
            <ScrollView scrollEnabled={false} style={{ marginHorizontal: -20 }}>
              {trips.map((t, i) => (
                <TripCard
                  key={t.id}
                  trip={t}
                  route={route}
                  index={i}
                  onPress={() => router.push(`/(passenger)/bus/${t.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    gap: 4,
  },
  muted: { color: "#64748B" },
  stop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 6,
  },
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
