import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { useAppSelector } from "@/store/hooks";
import { colors } from "@/theme/colors";

export default function PassengerHomeScreen() {
  const { user } = useAppSelector((state) => state.auth);

  console.log("users=======> ", user);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.primary[500]}
        />
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText variant="body" style={styles.eyebrow}>
              Good morning, {user?.fullName}! 👋
            </AppText>

            <AppText variant="h1" style={styles.title}>
              Where are you going?
            </AppText>
          </View>

          <Pressable style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={23}
              color={colors.text.primary}
            />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Search Card */}
        <Pressable
          style={({ pressed }) => [
            styles.searchCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(passenger)/search")}
        >
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={22} color={colors.primary[600]} />
          </View>

          <View style={styles.searchContent}>
            <AppText variant="body" style={styles.searchTitle}>
              Find your bus or route
            </AppText>

            <AppText variant="body" style={styles.searchSubtitle}>
              Search routes, stops and buses
            </AppText>
          </View>

          <Ionicons name="arrow-forward" size={20} color={colors.text.muted} />
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Quick actions
          </AppText>
        </View>

        <View style={styles.quickActions}>
          <QuickAction
            icon="bus-outline"
            title="Find Bus"
            subtitle="Search buses"
            onPress={() => router.push("/(passenger)/search")}
          />

          <QuickAction
            icon="navigate-outline"
            title="Track"
            subtitle="Live tracking"
            onPress={() => router.push("/(passenger)/(tabs)/track")}
          />

          <QuickAction
            icon="time-outline"
            title="My Trips"
            subtitle="Trip history"
            onPress={() => router.push("/(passenger)/(tabs)/trips")}
          />
        </View>

        {/* Active Journey */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Your journey
          </AppText>
        </View>

        <View style={styles.journeyCard}>
          <View style={styles.journeyTop}>
            <View style={styles.journeyIcon}>
              <Ionicons name="navigate" size={20} color={colors.primary[600]} />
            </View>

            <View style={styles.journeyInfo}>
              <AppText variant="body" style={styles.journeyLabel}>
                No active journey
              </AppText>

              <AppText variant="body" style={styles.journeyDescription}>
                Start tracking a bus to see your journey here.
              </AppText>
            </View>
          </View>

          <Pressable
            style={styles.journeyButton}
            onPress={() => router.push("/(passenger)/search")}
          >
            <AppText variant="body" style={styles.journeyButtonText}>
              Find a bus
            </AppText>

            <Ionicons
              name="arrow-forward"
              size={17}
              color={colors.primary[700]}
            />
          </Pressable>
        </View>

        {/* Nearby Buses */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Nearby buses
          </AppText>

          <Pressable>
            <AppText variant="body" style={styles.seeAll}>
              View all
            </AppText>
          </Pressable>
        </View>

        <BusCard
          busNumber="BUS 102"
          route="Sakchi → Mango"
          status="Arriving soon"
          eta="5 min"
        />

        <BusCard
          busNumber="BUS 204"
          route="Jugsalai → Bistupur"
          status="On route"
          eta="12 min"
        />

        {/* Popular Routes */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Popular routes
          </AppText>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeIcon}>
            <Ionicons
              name="git-branch-outline"
              size={20}
              color={colors.primary[600]}
            />
          </View>

          <View style={styles.routeInfo}>
            <AppText variant="body" style={styles.routeName}>
              Sakchi → Mango
            </AppText>

            <AppText variant="body" style={styles.routeMeta}>
              12.4 km • ~35 min
            </AppText>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.muted}
          />
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeIcon}>
            <Ionicons
              name="git-branch-outline"
              size={20}
              color={colors.primary[600]}
            />
          </View>

          <View style={styles.routeInfo}>
            <AppText variant="body" style={styles.routeName}>
              Bistupur → Adityapur
            </AppText>

            <AppText variant="body" style={styles.routeMeta}>
              9.8 km • ~28 min
            </AppText>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.muted}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  );
}

/* ---------------------------------- */
/* Quick Action Component             */
/* ---------------------------------- */

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={21} color={colors.primary[600]} />
      </View>

      <AppText variant="body" style={styles.quickTitle}>
        {title}
      </AppText>

      <AppText variant="body" style={styles.quickSubtitle}>
        {subtitle}
      </AppText>
    </Pressable>
  );
}

/* ---------------------------------- */
/* Bus Card Component                 */
/* ---------------------------------- */

function BusCard({
  busNumber,
  route,
  status,
  eta,
}: {
  busNumber: string;
  route: string;
  status: string;
  eta: string;
}) {
  return (
    <View style={styles.busCard}>
      <View style={styles.busIcon}>
        <Ionicons name="bus" size={21} color={colors.primary[600]} />
      </View>

      <View style={styles.busInfo}>
        <AppText variant="body" style={styles.busNumber}>
          {busNumber}
        </AppText>

        <AppText variant="body" style={styles.busRoute}>
          {route}
        </AppText>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />

          <AppText variant="body" style={styles.statusText}>
            {status}
          </AppText>
        </View>
      </View>

      <View style={styles.etaContainer}>
        <AppText variant="h2" style={styles.eta}>
          {eta}
        </AppText>

        <AppText variant="body" style={styles.etaLabel}>
          ETA
        </AppText>
      </View>
    </View>
  );
}

/* ---------------------------------- */
/* Styles                             */
/* ---------------------------------- */

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.text.primary,
    fontWeight: "700",
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    borderWidth: 1,
    borderColor: colors.background.secondary,
  },

  searchCard: {
    minHeight: 76,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  searchIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },

  searchContent: {
    flex: 1,
    marginLeft: 13,
  },

  searchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },

  searchSubtitle: {
    fontSize: 12,
    marginTop: 3,
    color: colors.text.muted,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary[600],
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  quickAction: {
    flex: 1,
    minHeight: 116,
    padding: 13,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },

  quickSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 3,
  },

  journeyCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    marginBottom: 28,
  },

  journeyTop: {
    flexDirection: "row",
  },

  journeyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  journeyInfo: {
    flex: 1,
    marginLeft: 12,
  },

  journeyLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },

  journeyDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },

  journeyButton: {
    marginTop: 16,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  journeyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary[700],
  },

  busCard: {
    minHeight: 92,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  busIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },

  busInfo: {
    flex: 1,
    marginLeft: 12,
  },

  busNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },

  busRoute: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
    marginRight: 6,
  },

  statusText: {
    fontSize: 10,
    color: colors.status.success,
    fontWeight: "600",
  },

  etaContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  eta: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary[700],
  },

  etaLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },

  routeCard: {
    minHeight: 70,
    borderRadius: 17,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  routeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },

  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  routeName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },

  routeMeta: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 3,
  },

  pressed: {
    opacity: 0.75,
  },

  bottomSpace: {
    height: 20,
  },
});
