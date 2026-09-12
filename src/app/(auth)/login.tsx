import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppInput from "@/components/inputs/AppInput";
import { Alert } from "react-native";

import { sendOtp } from "@/services/auth/auth.service";

import {
  normalizePhoneNumber,
  validatePhoneNumber,
} from "@/features/auth/auth.validation";

import { colors, radius, spacing } from "@/theme";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string>();

  const handleContinue = async () => {
  const validationError =
    validatePhoneNumber(phoneNumber);

  if (validationError) {
    setError(validationError);
    return;
  }

  setError(undefined);

  try {
    const normalizedPhone =
      normalizePhoneNumber(phoneNumber);

    await sendOtp({
      phoneNumber: normalizedPhone,
    });

    router.push({
      pathname: "/(auth)/otp",
      params: {
        phoneNumber: normalizedPhone,
      },
    });
  } catch (error) {
    console.error("Send OTP failed:", error);

    Alert.alert(
      "Unable to send OTP",
      "Something went wrong. Please try again."
    );
  }
};

  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AppText variant="h1">📱</AppText>
          </View>

          <AppText variant="h1" style={styles.title}>
            Welcome back
          </AppText>

          <AppText variant="body" style={styles.description}>
            Enter your mobile number to continue with RouteSync.
          </AppText>

          <View style={styles.phoneCard}>
            <View style={styles.countryCode}>
              <AppText variant="bodyMedium">
                +91
              </AppText>
            </View>

            <View style={styles.phoneInput}>
              <AppInput
                label="Mobile number"
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(value) => {
                  setPhoneNumber(value.replace(/\D/g, ""));
                  if (error) {
                    setError(undefined);
                  }
                }}
                error={error}
              />
            </View>
          </View>

          <AnimatedButton
            title="Continue"
            onPress={handleContinue}
            style={styles.button}
          />

          <AppText variant="caption" style={styles.privacy}>
            By continuing, you agree to RouteSync's terms
            and privacy policy.
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: spacing.xl,
  },

  description: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    lineHeight: 25,
  },

  phoneCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.xxxl,
  },

  countryCode: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  phoneInput: {
    flex: 1,
  },

  button: {
    marginTop: spacing.md,
  },

  privacy: {
    textAlign: "center",
    color: colors.text.muted,
    marginTop: spacing.xl,
    lineHeight: 20,
  },
});