// src/features/profile/ProfileScreen.tsx
//
// One profile UI for both roles. Data = the authenticated user already in Redux
// (loaded from GET /api/v1/users/me at startup); pull-to-refresh re-fetches it.
// Only fields the backend returns are shown; missing ones are simply hidden.
// There are no notification/preferences rows because the app has no
// notification backend - we don't show settings that do nothing.
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { Skeleton } from "@/components/feedback/Skeleton";
import { setUser } from "@/features/auth/auth.slice";
import { getCurrentUser } from "@/services/auth/auth.service";
import { logout } from "@/services/auth/logout.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { colors, radius, spacing } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];
export interface ProfileExtraRow { icon: IconName; label: string; value: string }

interface Props {
  role: "PASSENGER" | "DRIVER";
  /** Role-specific rows, e.g. the driver's assigned bus and route. */
  extraRows?: ProfileExtraRow[];
  extraTitle?: string;
}

const initials = (name?: string | null) =>
  (name ?? "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

export function ProfileScreen({ role, extraRows, extraTitle }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try { dispatch(setUser(await getCurrentUser())); } catch { /* keep cached profile */ } finally { setRefreshing(false); }
  };

  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll need to sign in with your phone number again.", [
      { text: "Stay signed in", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          if (loggingOut) return;
          setLoggingOut(true);
          try {
            await logout();
            router.replace("/(auth)/login");
          } finally { setLoggingOut(false); }
        },
      },
    ]);

  const account: ProfileExtraRow[] = user ? [
    ...(user.phoneNumber ? [{ icon: "call-outline" as IconName, label: "Phone", value: user.phoneNumber }] : []),
    ...(user.email ? [{ icon: "mail-outline" as IconName, label: "Email", value: user.email }] : []),
    { icon: "shield-checkmark-outline", label: "Account", value: user.active ? "Active" : "Inactive" },
  ] : [];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {!user ? (
          <><Skeleton height={120} radius={24} /><Skeleton height={160} radius={20} /></>
        ) : (
          <>
            <View style={styles.header}>
              {user.profileImage && !photoFailed ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatar} onError={() => setPhotoFailed(true)} accessibilityLabel="Profile photo" />
              ) : (
                <View style={[styles.avatar, styles.initials]} accessibilityLabel={`Avatar ${initials(user.fullName)}`}>
                  <AppText variant="h1" style={styles.initialsText}>{initials(user.fullName)}</AppText>
                </View>
              )}
              <AppText variant="h2" style={styles.name}>{user.fullName || "RouteSync user"}</AppText>
              <View style={styles.role}><AppText variant="caption" style={styles.roleText}>{role === "DRIVER" ? "Driver" : "Passenger"}</AppText></View>
            </View>

            <Section title="Account details" rows={account} />
            {extraRows && extraRows.length > 0 && <Section title={extraTitle ?? "Details"} rows={extraRows} />}
            <Section title="About" rows={[
              { icon: "information-circle-outline", label: "RouteSync", value: `Version ${Constants.expoConfig?.version ?? "1.0.0"}` },
            ]} />

            <AnimatedButton title="Log out" variant="danger" loading={loggingOut} onPress={confirmLogout} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Section({ title, rows }: { title: string; rows: ProfileExtraRow[] }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" style={styles.sectionTitle}>{title.toUpperCase()}</AppText>
      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.label} style={[styles.row, i > 0 && styles.rowBorder]} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
            <Ionicons name={r.icon} size={20} color={colors.primary[700]} />
            <AppText variant="caption" style={styles.label}>{r.label}</AppText>
            <AppText variant="bodyMedium" style={styles.value} numberOfLines={1}>{r.value}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  header: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  initials: { backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center" },
  initialsText: { color: "#FFFFFF" },
  name: { textAlign: "center" },
  role: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.primary[50] },
  roleText: { color: colors.primary[700], fontWeight: "700" },
  section: { gap: spacing.sm },
  sectionTitle: { color: "#64748B", fontWeight: "700", letterSpacing: 0.6 },
  card: { backgroundColor: "#FFFFFF", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border.light, paddingHorizontal: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 56 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border.light },
  label: { color: "#64748B", width: 64 },
  value: { flex: 1, textAlign: "right", color: "#0F172A" },
});
