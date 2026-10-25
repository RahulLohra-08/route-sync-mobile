import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { DriverTripCard } from "@/features/driver/components/DriverTripCard";
import { GpsStatusCard } from "@/features/driver/components/GpsStatusCard";
import { useNow } from "@/hooks/useNow";
import { useAppSelector } from "@/store/hooks";
import { colors, spacing } from "@/theme";
import { getGreeting } from "@/utils/date";
import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function DriverHome() {
  const router = useRouter();
  const s = useDriverSession();
  const nowDate = useNow(5_000);
  const name = useAppSelector((st) => st.auth.user?.fullName)?.split(" ")[0];
  const focus = s.activeTrip ?? s.nextTrip;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={s.refreshing} onRefresh={s.refresh} />
        }
      >
        <View>
          <AppText variant="caption" style={styles.muted}>
            {getGreeting(nowDate)}
            {name ? `, ${name}` : ""}
          </AppText>
          <AppText variant="h1">
            {s.activeTrip
              ? "Trip in progress"
              : focus
                ? "Next trip"
                : "Driver dashboard"}
          </AppText>
        </View>

        {s.loading ? (
          <>
            <Skeleton height={150} radius={20} />
            <Skeleton height={110} radius={20} />
          </>
        ) : s.loadError && s.trips.length === 0 ? (
          <ErrorState message={s.loadError} onRetry={s.refresh} />
        ) : (
          <>
            <GpsStatusCard
              gps={s.gps}
              tripRunning={!!s.activeTrip}
              now={nowDate.getTime()}
            />
            {s.actionError && (
              <AppText
                variant="bodyMedium"
                style={styles.error}
                accessibilityRole="alert"
              >
                {s.actionError}
              </AppText>
            )}
            {focus ? (
              <>
                <DriverTripCard trip={focus} />
                <AnimatedButton
                  title="Trip details & route stops"
                  variant="secondary"
                  onPress={() => router.push("/(driver)/(tabs)/trip")}
                />
              </>
            ) : (
              <EmptyState
                icon="bus-outline"
                title="No trip assigned"
                message="When dispatch assigns you a trip it will appear here. Pull down to refresh."
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  muted: { color: "#64748B" },
  error: { color: colors.status.error },
});
