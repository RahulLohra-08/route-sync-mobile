// src/features/profile/EditProfileModal.tsx
// Edits name + email via PUT /api/v1/users/me. Phone is shown read-only.
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import type { AuthUser } from "@/features/auth/auth.types";
import { getApiErrorMessage } from "@/services/api/api-client";
import { colors, radius, spacing } from "@/theme";
import { updateMe } from "./profile.api";
import { validateProfile, type ProfileErrors } from "./profile.logic";

interface Props {
  visible: boolean;
  user: AuthUser;
  onClose: () => void;
  onSaved: (user: AuthUser) => void;
}

export function EditProfileModal({ visible, user, onClose, onSaved }: Props) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return; // no duplicate submits
    const { errors: found, payload } = validateProfile({ fullName, email }, { fullName: user.fullName ?? "", email: user.email });
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length) return;
    if (!payload) { onClose(); return; } // nothing changed
    setSaving(true);
    try {
      onSaved(await updateMe(payload));
    } catch (e) {
      setServerError(getApiErrorMessage(e, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close edit profile" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <AppText variant="h2">Edit profile</AppText>

            <Field label="Full name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" textContentType="name" />
            <Field label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
            <View>
              <AppText variant="caption" style={styles.label}>Phone number</AppText>
              <View style={[styles.input, styles.readonly]}><AppText variant="body" style={{ color: "#64748B" }}>{user.phoneNumber ?? "Not set"}</AppText></View>
              <AppText variant="caption" style={styles.hint}>Your phone number is your login ID and can't be changed here.</AppText>
            </View>

            {serverError && <AppText variant="caption" style={styles.error} accessibilityRole="alert">{serverError}</AppText>}
            <AnimatedButton title="Save changes" onPress={save} loading={saving} />
            <AnimatedButton title="Cancel" variant="secondary" onPress={onClose} disabled={saving} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <AppText variant="caption" style={styles.label}>{label}</AppText>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor="#94A3B8"
        style={[styles.input, !!error && styles.inputError]}
      />
      {!!error && <AppText variant="caption" style={styles.error} accessibilityRole="alert">{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  sheet: { maxHeight: "88%", backgroundColor: "#FFFFFF", borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border.medium, marginTop: spacing.sm },
  form: { padding: spacing.xl, gap: spacing.lg },
  label: { color: "#475569", fontWeight: "600", marginBottom: 6 },
  input: { minHeight: 50, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border.medium, paddingHorizontal: spacing.lg, color: "#0F172A", fontSize: 16, justifyContent: "center" },
  inputError: { borderColor: colors.status.error },
  readonly: { backgroundColor: colors.background.secondary },
  hint: { color: "#64748B", marginTop: 6 },
  error: { color: colors.status.error, marginTop: 6 },
});
