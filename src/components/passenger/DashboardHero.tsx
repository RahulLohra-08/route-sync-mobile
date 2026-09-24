import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/common/PressableScale";
import { palette } from "@/theme/passenger";
import { getGreeting } from "@/utils/date";

interface Props {
  userName?: string;
  now: Date;
  unreadCount?: number;
  onSearchPress: () => void;
  onBellPress: () => void;
}

export function DashboardHero({
  userName,
  now,
  unreadCount = 0,
  onSearchPress,
  onBellPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const firstName = userName?.trim().split(" ")[0];

  return (
    <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
      <View style={styles.ring} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {firstName ? `${getGreeting(now)}, ${firstName}` : getGreeting(now)}
          </Text>
          <Text style={styles.title}>Where to today?</Text>
        </View>

        <PressableScale
          onPress={onBellPress}
          scaleTo={0.9}
          style={styles.bell}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          {unreadCount > 0 && <View style={styles.unread} />}
        </PressableScale>
      </View>

      <PressableScale
        onPress={onSearchPress}
        scaleTo={0.98}
        style={styles.search}
      >
        <Ionicons name="search" size={20} color={palette.muted} />
        <Text style={styles.placeholder}>Search routes or stops</Text>
        <View style={styles.searchGo}>
          <Ionicons name="arrow-forward" size={16} color={palette.ink} />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: palette.ink,
    paddingHorizontal: 20,
    paddingBottom: 56,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    right: -70,
    top: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 28,
    borderColor: "rgba(255,255,255,0.045)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  unread: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.amber,
    borderWidth: 1.5,
    borderColor: palette.ink,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 8,
    height: 56,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: palette.muted,
    fontWeight: "500",
  },
  searchGo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: palette.amber,
    alignItems: "center",
    justifyContent: "center",
  },
});
