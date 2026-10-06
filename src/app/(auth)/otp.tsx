import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";

import {
  getCurrentUser,
  sendOtp,
  verifyOtp,
} from "@/services/auth/auth.service";

import AuthLayout from "@/components/auth/AuthLayout";
import OtpInput from "@/components/auth/OtpInput";
import { setUser } from "@/features/auth/auth.slice";
import { saveTokens } from "@/services/auth/token.service";
import { store } from "@/store";
import { animation, colors, spacing } from "@/theme";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const enter = (delay: number) =>
  FadeInDown.delay(delay)
    .springify()
    .damping(animation.spring.damping)
    .stiffness(animation.spring.stiffness);

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}${"•".repeat(
    Math.max(name.length - 2, 2),
  )}@${domain}`;
};

export default function OtpScreen() {
  const { email = "" } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const [isVerifying, setIsVerifying] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [isResending, setIsResending] = useState(false);

  // -----------------------------------------
  // Resend countdown
  // -----------------------------------------

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const id = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [secondsLeft]);

  // -----------------------------------------
  // Verify OTP
  // -----------------------------------------

  const handleVerify = useCallback(
    async (code: string) => {
      // Always sanitize before sending
      const cleanCode = code.replace(/\D/g, "").slice(0, OTP_LENGTH);

      console.log("OTP verification started:", cleanCode);

      if (cleanCode.length !== OTP_LENGTH || isVerifying) {
        return;
      }

      setIsVerifying(true);
      setHasError(false);
      setErrorMessage(undefined);

      try {
        console.log("Sending OTP verification:", {
          email,
          otpLength: cleanCode.length,
        });

        const authResponse = await verifyOtp({
          email,
          otp: cleanCode,
          purpose: "LOGIN",
        });

        console.log("OTP verification successful:", authResponse);

        // TODO:
        // Save accessToken / refreshToken
        // Dispatch authenticated user
        // Then redirect.

        // router.replace("/");

        /*
         * STEP 2
         * Save JWT tokens
         */
        await saveTokens(authResponse.accessToken, authResponse.refreshToken);

        console.log("Tokens saved successfully");

        /*
         * STEP 3
         * Fetch authenticated user
         */
        const user = await getCurrentUser();

        console.log("Current user:", user);

        store.dispatch(setUser(user));

        console.log("set Current user into redux:");

        /*
         * STEP 4
         * Role based navigation
         */
        if (user.role === "PASSENGER") {
          router.replace("/(passenger)/(tabs)");
          return;
        }

        if (user.role === "DRIVER") {
          router.replace("/(driver)/(tabs)");
          return;
        }

        /*
         * ADMIN has a separate dashboard.
         */
        if (user.role === "ADMIN") {
          Alert.alert(
            "Admin Account",
            "Please use the RouteSync Admin Dashboard.",
          );
          return;
        }

        throw new Error("Unknown user role.");
      } catch (err: any) {
        console.error("OTP verification failed:", err?.response?.data || err);

        setHasError(true);

        setErrorMessage(
          err?.response?.data?.message ||
            "That code isn't right. Check your email and try again.",
        );

        setOtp("");
      } finally {
        setIsVerifying(false);
      }
    },
    [email, isVerifying],
  );

  // -----------------------------------------
  // OTP input changed
  // -----------------------------------------

  const handleChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, OTP_LENGTH);

    setOtp(cleanValue);

    if (hasError) {
      setHasError(false);
      setErrorMessage(undefined);
    }

    // Auto-submit after 6th digit
    if (cleanValue.length === OTP_LENGTH) {
      handleVerify(cleanValue);
    }
  };

  // -----------------------------------------
  // Resend OTP
  // -----------------------------------------

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);

    try {
      await sendOtp({
        email,
        purpose: "LOGIN",
      });

      setOtp("");
      setHasError(false);
      setErrorMessage(undefined);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err: any) {
      Alert.alert(
        "Couldn't resend the code",
        err?.response?.data?.message || err?.message || "Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${maskEmail(email)}`}
      onBack={() => router.back()}
    >
      <Animated.View entering={enter(350)}>
        <AppText variant="h3">Enter your code</AppText>
      </Animated.View>

      <Animated.View entering={enter(450)} style={styles.otpWrap}>
        <OtpInput
          value={otp}
          onChange={handleChange}
          length={OTP_LENGTH}
          hasError={hasError}
          disabled={isVerifying}
        />

        {errorMessage ? (
          <Animated.View entering={FadeIn.duration(animation.duration.normal)}>
            <Text style={styles.error}>{errorMessage}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.View entering={enter(550)}>
        <AnimatedButton
          title={isVerifying ? "Verifying..." : "Verify and continue"}
          onPress={() => handleVerify(otp)}
          disabled={isVerifying || otp.length !== OTP_LENGTH}
        />
      </Animated.View>

      <Animated.View entering={enter(650)} style={styles.resendRow}>
        <AppText variant="caption" style={styles.resendLabel}>
          Didn't get it?
        </AppText>

        {secondsLeft > 0 ? (
          <AppText variant="caption" style={styles.resendLabel}>
            Resend in 0:
            {String(secondsLeft).padStart(2, "0")}
          </AppText>
        ) : (
          <Pressable onPress={handleResend} hitSlop={10} disabled={isResending}>
            <Text style={styles.resendAction}>
              {isResending ? "Sending..." : "Send a new code"}
            </Text>
          </Pressable>
        )}
      </Animated.View>

      <Animated.View entering={enter(750)} style={styles.tip}>
        <Text style={styles.tipIcon}>💡</Text>

        <AppText variant="caption" style={styles.tipText}>
          Can't find it? Look in your spam folder, or go back and check that
          your email address is correct.
        </AppText>
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  otpWrap: {
    marginVertical: spacing.xxl,
    gap: spacing.md,
  },

  error: {
    color: colors.status.error,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  resendRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },

  resendLabel: {
    color: colors.text.secondary,
  },

  resendAction: {
    color: colors.primary[600],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  tip: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  tipIcon: {
    fontSize: 16,
  },

  tipText: {
    flex: 1,
    color: colors.text.secondary,
  },
});
