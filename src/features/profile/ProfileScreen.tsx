// src/features/profile/ProfileScreen.tsx
//
// One profile UI for both roles. Data = authenticated user in Redux (GET
// /api/v1/users/me) + for drivers the real driver record (GET /drivers/user/{id}).
// Editable: name + email (PUT /users/me). Missing fields are hidden, never faked.
// Not shown because the backend has no support: avatar upload, student/pass/fee,
// emergency contact, driver rating/experience, notification & language settings.
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { Skeleton } from "@/components/feedback/Skeleton";
import { setUser } from "@/features/auth/auth.slice";
import type { AuthUser } from "@/features/auth/auth.types";
import { getCurrentUser } from "@/services/auth/auth.service";
import { logout } from "@/services/auth/logout.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { colors, radius, spacing } from "@/theme";
import { EditProfileModal } from "./EditProfileModal";
import { licenseState } from "./profile.logic";
import { useDriverProfile } from "./useDriverProfile";

type IconName = ComponentProps<typeof Ionicons>["name"];
export interface ProfileRow { icon: IconName; label: string; value: string; tone?: "warn" | "bad" }

interface Props {
  role: "PASSENGER" | "DRIVER";
  /** Role-specific rows from the caller (e.g. the driver's current bus/route). */
  extraRows?: ProfileRow[];
  extraTitle?: string;
  /** Driver only: number of COMPLETED trips from the driver's real trip list. */
  completedTrips?: number;
}

const initials = (name?: string | null) =>
  (name ?? "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
const pretty = (v: string) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export function ProfileScreen({ role, extraRows, extraTitle, completedTrips }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isDriver = role === "DRIVER";
  const driver = useDriverProfile(user?.id, isDriver);

  const [refreshing, setRefreshing] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    if (!savedNote) return;
    const id = setTimeout(() => setSavedNote(false), 2500);
    return () => clearTimeout(id);
  }, [savedNote]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      dispatch(setUser(await getCurrentUser()));
      if (isDriver) await driver.reload();
    } catch { /* keep cached profile */ } finally { setRefreshing(false); }
  };

  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll need to sign in with your phone number again.", [
      { text: "Stay signed in", style: "cancel" },
      {
        text: "Log out", style: "destructive",
        onPress: async () => {
          if (loggingOut) return;
          setLoggingOut(true);
          try { await logout(); router.replace("/(auth)/login"); } finally { setLoggingOut(false); }
        },
      },
    ]);

  const account: ProfileRow[] = useMemo(() => !user ? [] : [
    ...(user.phoneNumber ? [{ icon: "call-outline" as IconName, label: "Phone", value: user.phoneNumber }] : []),
    ...(user.email ? [{ icon: "mail-outline" as IconName, label: "Email", value: user.email }] : []),
    { icon: "shield-checkmark-outline" as IconName, label: "Account", value: user.active ? "Active" : "Inactive" },
  ], [user]);

  const driverRows: ProfileRow[] = useMemo(() => {
    const d = driver.driver;
    if (!d) return [];
    const lic = licenseState(d.licenseExpiryDate, new Date());
    return [
      { icon: "id-card-outline", label: "Employee", value: d.employeeCode },
      { icon: "card-outline", label: "Licence", value: d.licenseNumber },
      ...(d.licenseExpiryDate ? [{
        icon: "calendar-outline" as IconName, label: "Expires", value: lic.state === "expired" ? `${d.licenseExpiryDate} (expired)` : lic.state === "soon" ? `${d.licenseExpiryDate} (${lic.daysLeft} days left)` : d.licenseExpiryDate,
        tone: lic.state === "expired" ? "bad" as const : lic.state === "soon" ? "warn" as const : undefined,
      }] : []),
      { icon: "pulse-outline", label: "Duty", value: pretty(d.status) },
      ...(completedTrips !== undefined ? [{ icon: "checkmark-done-outline" as IconName, label: "Trips", value: `${completedTrips} completed` }] : []),
    ];
  }, [driver.driver, completedTrips]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {!user ? (
          <><Skeleton height={120} radius={24} /><Skeleton height={160} radius={20} /></>
        ) : (
          <>
            <Header user={user} role={role} photoFailed={photoFailed} onPhotoError={() => setPhotoFailed(true)} onEdit={() => setEditing(true)} />

            {savedNote && (
              <Animated.View entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(150)} style={styles.toast} accessibilityLiveRegion="polite">
                <Ionicons name="checkmark-circle" size={18} color={colors.primary[700]} />
                <AppText variant="caption" style={{ color: colors.primary[700], fontWeight: "700" }}>Profile updated</AppText>
              </Animated.View>
            )}

            <Section title="Account details" rows={account} />
            {isDriver && (
              driver.loading ? <Skeleton height={150} radius={20} />
              : driver.error ? <AppText variant="caption" style={styles.err}>{driver.error}</AppText>
              : <Section title="Driver details" rows={driverRows} />
            )}
            {extraRows && extraRows.length > 0 && <Section title={extraTitle ?? "Details"} rows={extraRows} />}
            <Section title="About" rows={[{ icon: "information-circle-outline", label: "App", value: `RouteSync ${Constants.expoConfig?.version ?? "1.0.0"}` }]} />

            <AnimatedButton title="Log out" variant="danger" loading={loggingOut} onPress={confirmLogout} />
          </>
        )}
      </ScrollView>

      {user && editing && (
        <EditProfileModal visible user={user} onClose={() => setEditing(false)}
          onSaved={(u) => { dispatch(setUser(u)); setEditing(false); setSavedNote(true); }} />
      )}
    </Screen>
  );
}

function Header({ user, role, photoFailed, onPhotoError, onEdit }: { user: AuthUser; role: Props["role"]; photoFailed: boolean; onPhotoError: () => void; onEdit: () => void }) {
  return (
    <View style={styles.header}>
      {user.profileImage && !photoFailed ? (
        <Image source={{ uri: user.profileImage }} style={styles.avatar} onError={onPhotoError} accessibilityLabel="Profile photo" />
      ) : (
        <View style={[styles.avatar, styles.initials]} accessibilityLabel={`Avatar ${initials(user.fullName)}`}>
          <AppText variant="h1" style={{ color: "#FFFFFF" }}>{initials(user.fullName)}</AppText>
        </View>
      )}
      <AppText variant="h2" style={{ textAlign: "center" }}>{user.fullName || "RouteSync user"}</AppText>
      <View style={styles.role}><AppText variant="caption" style={styles.roleText}>{role === "DRIVER" ? "Driver" : "Passenger"}</AppText></View>
      <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel="Edit profile" style={styles.edit}>
        <Ionicons name="create-outline" size={16} color={colors.primary[700]} />
        <AppText variant="caption" style={{ color: colors.primary[700], fontWeight: "700" }}>Edit profile</AppText>
      </Pressable>
    </View>
  );
}

function Section({ title, rows }: { title: string; rows: ProfileRow[] }) {
  if (rows.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="caption" style={styles.sectionTitle}>{title.toUpperCase()}</AppText>
      <View style={styles.card}>
        {rows.map((r, i) => {
          const c = r.tone === "bad" ? colors.status.error : r.tone === "warn" ? "#B45309" : "#0F172A";
          return (
            <View key={r.label} style={[styles.row, i > 0 && styles.rowBorder]} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
              <Ionicons name={r.icon} size={20} color={r.tone ? c : colors.primary[700]} />
              <AppText variant="caption" style={styles.label}>{r.label}</AppText>
              <AppText variant="bodyMedium" style={[styles.value, { color: c }]} numberOfLines={2}>{r.value}</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  header: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  initials: { backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center" },
  role: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.primary[50] },
  roleText: { color: colors.primary[700], fontWeight: "700" },
  edit: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: spacing.md },
  toast: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.primary[50] },
  sectionTitle: { color: "#64748B", fontWeight: "700", letterSpacing: 0.6 },
  card: { backgroundColor: "#FFFFFF", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border.light, paddingHorizontal: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 56, paddingVertical: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border.light },
  label: { color: "#64748B", width: 72 },
  value: { flex: 1, textAlign: "right" },
  err: { color: colors.status.error },
});
