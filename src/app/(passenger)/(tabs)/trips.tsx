import { TripCard } from "@/components/cards/TripCard";
import AppText from "@/components/common/AppText";
import { FilterChips, type ChipOption } from "@/components/common/FilterChips";
import Screen from "@/components/common/Screen";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import {
  usePassengerDashboard,
  type TripFilter,
} from "@/features/passenger/usePassengerDashboard";
import { useNow } from "@/hooks/useNow";
import { spacing } from "@/theme";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

/** Real trips from GET /api/v1/passenger/trips (SCHEDULED, BOARDING, IN_PROGRESS). */
export default function Trips() {
  const router = useRouter();
  const now = useNow();
  const d = usePassengerDashboard();
  const [filter, setFilter] = useState<TripFilter>("ALL");

  const options: ChipOption<TripFilter>[] = [
    { key: "ALL", label: "All", count: d.trips.length },
    { key: "LIVE", label: "Live", count: d.liveTrips.length },
    { key: "BOARDING", label: "Boarding", count: d.boardingTrips.length },
    { key: "SCHEDULED", label: "Scheduled", count: d.scheduledTrips.length },
  ];
  const data = useMemo(
    () =>
      ({
        ALL: d.trips,
        LIVE: d.liveTrips,
        BOARDING: d.boardingTrips,
        SCHEDULED: d.scheduledTrips,
      })[filter],
    [filter, d.trips, d.liveTrips, d.boardingTrips, d.scheduledTrips],
  );

  return (
    <Screen>
      <AppText variant="h1" style={styles.title}>
        Trips
      </AppText>
      <FilterChips options={options} value={filter} onChange={setFilter} />
      {d.loading ? (
        <View style={styles.skeletons}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} radius={20} />
          ))}
        </View>
      ) : d.error && d.trips.length === 0 ? (
        <ErrorState message={d.error} onRetry={d.reload} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={d.refreshing} onRefresh={d.refresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="bus-outline"
              title="No trips here"
              message="There are no trips in this category right now. Pull down to refresh."
            />
          }
          renderItem={({ item, index }) => (
            <TripCard
              trip={item}
              route={d.routesById.get(item.routeId)}
              now={now}
              index={index}
              onPress={() => router.push(`/(passenger)/bus/${item.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.md },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    marginHorizontal: -20,
    flexGrow: 1,
  },
  skeletons: { gap: spacing.md, paddingTop: spacing.lg },
});
