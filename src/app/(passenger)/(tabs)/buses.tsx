import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import AppText from "@/components/common/AppText";
import { FilterChips, type ChipOption } from "@/components/common/FilterChips";
import Screen from "@/components/common/Screen";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { BusCard } from "@/features/buses/BusCard";
import { matchesBus } from "@/features/buses/busStatus";
import { useBusDirectory } from "@/features/buses/useBusDirectory";
import { colors, radius, spacing } from "@/theme";

type BusFilter = "ALL" | "ON_TRIP" | "AVAILABLE" | "UNAVAILABLE";

/** GET /api/v1/buses joined with real trips. Filters use only fields we actually have. */
export default function Buses() {
  const router = useRouter();
  const d = useBusDirectory();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BusFilter>("ALL");

  const group = (k: BusFilter) => d.entries.filter((e) =>
    k === "ALL" ? true
    : k === "ON_TRIP" ? e.state === "live" || e.state === "boarding" || e.state === "scheduled"
    : k === "AVAILABLE" ? e.state === "idle"
    : e.state === "maintenance" || e.state === "inactive");

  const options: ChipOption<BusFilter>[] = [
    { key: "ALL", label: "All", count: d.entries.length },
    { key: "ON_TRIP", label: "On trip", count: group("ON_TRIP").length },
    { key: "AVAILABLE", label: "Idle", count: group("AVAILABLE").length },
    { key: "UNAVAILABLE", label: "Unavailable", count: group("UNAVAILABLE").length },
  ];
  const data = useMemo(() => group(filter).filter((e) => matchesBus(e, query)), [d.entries, filter, query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <AppText variant="h1">Buses</AppText>
        <AppText variant="caption" style={styles.muted}>Find a bus and follow it live.</AppText>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Bus number, registration or route"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search buses"
          />
          {query.length > 0 && (
            <Ionicons name="close-circle" size={18} color="#94A3B8" onPress={() => setQuery("")} accessibilityLabel="Clear search" />
          )}
        </View>
        <FilterChips options={options} value={filter} onChange={setFilter} />

        {d.loading ? (
          <View style={styles.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={130} radius={20} />)}</View>
        ) : d.error ? (
          <ErrorState message={d.error} onRetry={d.refresh} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(e) => e.bus.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={d.refreshing} onRefresh={d.refresh} />}
            ListEmptyComponent={
              <EmptyState
                icon="bus-outline"
                title={query ? "No matching bus" : "No buses here"}
                message={query ? "Try a different bus number or route." : "Nothing in this category right now. Pull down to refresh."}
              />
            }
            renderItem={({ item }) => <BusCard entry={item} onTrack={(tripId) => router.push(`/(passenger)/bus/${tripId}`)} />}
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: "#64748B", marginBottom: spacing.md },
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.light, marginBottom: spacing.md },
  input: { flex: 1, color: "#0F172A", fontSize: 15, paddingVertical: 10 },
  list: { paddingTop: spacing.md, paddingBottom: spacing.xxxl, flexGrow: 1 },
  sk: { gap: spacing.md, paddingTop: spacing.lg },
});
