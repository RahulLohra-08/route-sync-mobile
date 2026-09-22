import { router } from "expo-router";
import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import AppInput from "@/components/inputs/AppInput";

import {
  normalizeEmail,
  validateEmail,
} from "@/features/auth/auth.validation";

import { sendOtp } from "@/services/auth/auth.service";

import {
  colors,
  radius,
  spacing,
} from "@/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);

      console.log(
        "Sending login OTP to:",
        normalizedEmail
      );

      await sendOtp({
        email: normalizedEmail,
        purpose: "LOGIN",
      });

      console.log("OTP sent successfully");

      router.push({
        pathname: "/(auth)/otp",
        params: {
          email: normalizedEmail,
        },
      });
    } catch (error: any) {
      console.error(
        "Send OTP failed:",
        error
      );

      const status =
        error?.response?.status;

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send OTP. Please try again.";

      Alert.alert(
        `Unable to send OTP${
          status ? ` (${status})` : ""
        }`,
        message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.container}>

          <View style={styles.header}>
            <AppText variant="h1">
              Welcome back
            </AppText>

            <AppText
              variant="body"
              style={styles.subtitle}
            >
              Enter your email address to
              continue with RouteSync.
            </AppText>
          </View>

          <View style={styles.form}>

            <AppInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(undefined);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />

            <AnimatedButton
              title={
                isLoading
                  ? "Sending OTP..."
                  : "Continue"
              }
              onPress={handleContinue}
              disabled={isLoading}
            />

            <AppText
              variant="caption"
              style={styles.info}
            >
              We will send a 6-digit OTP to
              your email address.
            </AppText>

          </View>

        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },

  header: {
    marginBottom: spacing.xxxl,
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },

  form: {
    gap: spacing.lg,
  },

  info: {
    textAlign: "center",
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});