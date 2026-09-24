import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/theme/colors";

import AppText from "@/components/common/AppText";
import { passengerApi } from "@/features/passenger/passenger.api";
import type { RouteResponse } from "@/features/passenger/passenger.types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PassengerSearchScreen() {
  const [query, setQuery] = useState("");
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setRoutes([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await passengerApi.searchRoutes(trimmedQuery);

        setRoutes(result);
      } catch (err) {
        console.error("Route search failed:", err);
        setError("Unable to search routes.");
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  function handleRoutePress(routeId: string) {
    router.push({
      pathname: "/(passenger)/route/[id]",
      params: { id: routeId },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="h1">Find your bus</AppText>

        <AppText variant="body">Search by route name or route code</AppText>

        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search route..."
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            autoFocus
          />
        </View>

        {loading && (
          <ActivityIndicator size="small" color={colors.primary[600]} />
        )}

        {error && <AppText variant="body">{error}</AppText>}

        {!loading && query.trim() && routes.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <AppText variant="h2">No routes found</AppText>

            <AppText variant="body">
              Try another route name or route code.
            </AppText>
          </View>
        )}

        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.routeCard}
              onPress={() => handleRoutePress(item.id)}
            >
              <View style={styles.routeHeader}>
                <AppText variant="h2">{item.routeCode}</AppText>

                <View style={styles.statusBadge}>
                  <AppText variant="body">{item.status}</AppText>
                </View>
              </View>

              <AppText variant="body">{item.routeName}</AppText>

              <AppText variant="body">
                {item.startLocation} → {item.endLocation}
              </AppText>

              <AppText variant="body">
                {item.distanceKm} km • {item.estimatedDurationMinutes} min
              </AppText>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },

  searchContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
  },

  list: {
    gap: 12,
    paddingBottom: 30,
  },

  routeCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 8,
  },

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primary[50],
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
});
