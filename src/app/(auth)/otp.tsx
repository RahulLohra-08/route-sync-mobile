import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import AppInput from "@/components/inputs/AppInput";

import {
  normalizeEmail,
  validateOtp,
} from "@/features/auth/auth.validation";

import {
  getCurrentUser,
  verifyOtp,
} from "@/services/auth/auth.service";

import {
  saveTokens,
} from "@/services/auth/token.service";

import {
  colors,
  spacing,
} from "@/theme";

export default function OtpScreen() {
  const params =
    useLocalSearchParams<{
      email?: string;
    }>();

  const email = params.email ?? "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleVerify = async () => {
    const validationError =
      validateOtp(otp);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!email) {
      Alert.alert(
        "Error",
        "Email address is missing."
      );
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const normalizedEmail =
        normalizeEmail(email);

      console.log(
        "Verifying OTP for:",
        normalizedEmail
      );

      /*
       * STEP 1
       * Verify OTP
       */
      const authResponse =
        await verifyOtp({
          email: normalizedEmail,
          otp: otp.trim(),
          purpose: "LOGIN",
        });

      console.log(
        "OTP verification successful"
      );

      /*
       * STEP 2
       * Save JWT tokens
       */
      await saveTokens(
        authResponse.accessToken,
        authResponse.refreshToken
      );

      console.log(
        "Tokens saved successfully"
      );

      /*
       * STEP 3
       * Fetch authenticated user
       */
      const user = await getCurrentUser();

      console.log(
        "Current user:",
        user
      );

      /*
       * STEP 4
       * Role based navigation
       */
      if (user.role === "PASSENGER") {
        router.replace("/(passenger)");
        return;
      }

      if (user.role === "DRIVER") {
        router.replace("/(driver)");
        return;
      }

      /*
       * ADMIN has a separate dashboard.
       */
      if (user.role === "ADMIN") {
        Alert.alert(
          "Admin Account",
          "Please use the RouteSync Admin Dashboard."
        );
        return;
      }

      throw new Error(
        "Unknown user role."
      );

    } catch (error: any) {
      console.error(
        "OTP verification failed:",
        error
      );

      const status =
        error?.response?.status;

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed.";

      Alert.alert(
        `Verification Failed${
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
      <View style={styles.container}>

        <View style={styles.header}>
          <AppText variant="h1">
            Verify your email
          </AppText>

          <AppText
            variant="body"
            style={styles.subtitle}
          >
            Enter the 6-digit OTP sent to
          </AppText>

          <AppText
            variant="bodyMedium"
            style={styles.email}
          >
            {email}
          </AppText>
        </View>

        <View style={styles.form}>

          <AppInput
            label="OTP"
            placeholder="000000"
            value={otp}
            onChangeText={(value) => {
              const cleaned =
                value
                  .replace(/\D/g, "")
                  .slice(0, 6);

              setOtp(cleaned);
              setError(undefined);
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
          />

          <AnimatedButton
            title={
              isLoading
                ? "Verifying..."
                : "Verify OTP"
            }
            onPress={handleVerify}
            disabled={
              isLoading ||
              otp.length !== 6
            }
          />

        </View>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  header: {
    marginBottom: spacing.xxxl,
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },

  email: {
    marginTop: spacing.xs,
    color: colors.primary[600],
  },

  form: {
    gap: spacing.lg,
  },
});