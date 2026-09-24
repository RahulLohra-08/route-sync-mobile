import { ETACard } from "@/components/cards/ETACard";
import { RouteCard } from "@/components/cards/RouteCard";
import { TripCard } from "@/components/cards/TripCard";
import { FilterChips, type ChipOption } from "@/components/common/FilterChips";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { DashboardHero } from "@/components/passenger/DashboardHero";
import { DashboardSkeleton } from "@/components/passenger/DashboardSkeleton";
import {
  QuickActions,
  type QuickAction,
} from "@/components/passenger/QuickActions";
import { StatsRow } from "@/components/passenger/StatsRow";
import {
  usePassengerDashboard,
  type TripFilter,
} from "@/features/passenger/usePassengerDashboard";
import { useNow } from "@/hooks/useNow";
import { useAppSelector } from "@/store/hooks";
import { palette } from "@/theme/passenger";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

const go = (href: string) => router.push(href as Href);

export default function PassengerDashboardScreen() {
  const {
    trips,
    routes,
    routesById,
    liveTrips,
    boardingTrips,
    scheduledTrips,
    featuredTrip,
    loading,
    refreshing,
    error,
    refresh,
    reload,
  } = usePassengerDashboard();

  const now = useNow(30_000);
  const [filter, setFilter] = useState<TripFilter>("ALL");

  // Adjust this selector to wherever your auth slice keeps the profile.
  const userName = useAppSelector(
    (state) => (state as any).auth?.user?.fullName as string | undefined,
  );

  const filteredTrips = useMemo(() => {
    switch (filter) {
      case "LIVE":
        return liveTrips;
      case "BOARDING":
        return boardingTrips;
      case "SCHEDULED":
        return scheduledTrips;
      default:
        return trips;
    }
  }, [filter, trips, liveTrips, boardingTrips, scheduledTrips]);

  const chips: ChipOption<TripFilter>[] = [
    { key: "ALL", label: "All", count: trips.length },
    { key: "LIVE", label: "On the way", count: liveTrips.length },
    { key: "BOARDING", label: "Boarding", count: boardingTrips.length },
    { key: "SCHEDULED", label: "Scheduled", count: scheduledTrips.length },
  ];

  const quickActions: QuickAction[] = [
    {
      key: "search",
      label: "Search",
      icon: "search",
      onPress: () => go("/(passenger)/search"),
    },
    {
      key: "track",
      label: "Track bus",
      icon: "navigate-outline",
      onPress: () => go("/(passenger)/(tabs)/track"),
    },
    {
      key: "trips",
      label: "My trips",
      icon: "ticket-outline",
      onPress: () => go("/(passenger)/(tabs)/trips"),
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: "notifications-outline",
      onPress: () => go("/(passenger)/(tabs)/notifications"),
    },
  ];

  const showError = !loading && error && trips.length === 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#fff"
            colors={[palette.ink]}
            progressBackgroundColor="#fff"
          />
        }
      >
        <DashboardHero
          userName={userName}
          now={now}
          onSearchPress={() => go("/(passenger)/search")}
          onBellPress={() => go("/(passenger)/(tabs)/notifications")}
        />

        <StatsRow
          stats={[
            {
              key: "live",
              label: "Buses live",
              value: loading ? null : liveTrips.length,
              live: true,
            },
            {
              key: "boarding",
              label: "Boarding",
              value: loading ? null : boardingTrips.length,
            },
            {
              key: "routes",
              label: "Routes",
              value: loading ? null : routes.length,
            },
          ]}
        />

        <View style={styles.body}>
          {loading ? (
            <DashboardSkeleton />
          ) : showError ? (
            <ErrorState message={error ?? undefined} onRetry={reload} />
          ) : (
            <>
              {featuredTrip && (
                <View style={styles.pad}>
                  <ETACard
                    trip={featuredTrip}
                    route={routesById.get(featuredTrip.routeId)}
                    now={now}
                    onPress={() => go(`/(passenger)/bus/${featuredTrip.busId}`)}
                  />
                </View>
              )}

              <QuickActions actions={quickActions} />

              {routes.length > 0 && (
                <View>
                  <SectionHeader
                    title="Popular routes"
                    subtitle="Tap a route to see its stops and buses"
                    actionLabel="See all"
                    onAction={() => go("/(passenger)/search")}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.routes}
                    decelerationRate="fast"
                    snapToInterval={244}
                  >
                    {routes.slice(0, 8).map((route) => (
                      <RouteCard
                        key={route.id}
                        route={route}
                        onPress={() => go(`/(passenger)/route/${route.id}`)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              <View>
                <SectionHeader
                  title="Trips you can catch"
                  subtitle="Updates every 20 seconds"
                />
                <FilterChips
                  options={chips}
                  value={filter}
                  onChange={setFilter}
                />

                <View style={{ marginTop: 14 }}>
                  {filteredTrips.length === 0 ? (
                    <EmptyState
                      icon="bus-outline"
                      title={
                        filter === "ALL"
                          ? "No trips right now"
                          : "Nothing in this list"
                      }
                      message={
                        filter === "ALL"
                          ? "New trips show up here as soon as they are scheduled. Pull down to refresh."
                          : "Try another filter to see the rest of today’s trips."
                      }
                      actionLabel={
                        filter === "ALL" ? "Refresh" : "Show all trips"
                      }
                      onAction={
                        filter === "ALL" ? refresh : () => setFilter("ALL")
                      }
                    />
                  ) : (
                    filteredTrips.map((trip, index) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        route={routesById.get(trip.routeId)}
                        now={now}
                        index={index}
                        onPress={() => go(`/(passenger)/bus/${trip.busId}`)}
                      />
                    ))
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { paddingBottom: 120 },
  body: { marginTop: 22, gap: 28 },
  pad: { paddingHorizontal: 20 },
  routes: { paddingHorizontal: 20, gap: 12 },
});
