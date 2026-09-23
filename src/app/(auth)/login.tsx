import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import AuthLayout from "@/components/auth/AuthLayout";
import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import AppInput from "@/components/inputs/AppInput";

import { normalizeEmail, validateEmail } from "@/features/auth/auth.validation";
import { sendOtp } from "@/services/auth/auth.service";

import { animation, colors, spacing } from "@/theme";

const enter = (delay: number) =>
  FadeInDown.delay(delay)
    .springify()
    .damping(animation.spring.damping)
    .stiffness(animation.spring.stiffness);

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

      await sendOtp({ email: normalizedEmail, purpose: "LOGIN" });

      router.push({
        pathname: "/(auth)/otp",
        params: { email: normalizedEmail },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send OTP. Please try again.";

      Alert.alert(`Unable to send OTP${status ? ` (${status})` : ""}`, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email to see where your bus is right now."
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      backgroundImage={require("@/assets/images/bus-bg.jpg")}
    >
      <Animated.View entering={enter(350)}>
        <AppText variant="h3">Sign in</AppText>
        <AppText variant="caption" style={styles.hint}>
          No password needed. We email you a one-time code.
        </AppText>
      </Animated.View>

      <View style={styles.form}>
        <Animated.View entering={enter(450)}>
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
        </Animated.View>

        <Animated.View entering={enter(550)}>
          <AnimatedButton
            title={isLoading ? "Sending code..." : "Send code"}
            onPress={handleContinue}
            disabled={isLoading}
          />
        </Animated.View>
      </View>

      <Animated.View entering={enter(650)} style={styles.trust}>
        <Text style={styles.trustIcon}>🔒</Text>
        <AppText variant="caption" style={styles.trustText}>
          We send a 6-digit code to your email. It expires in a few minutes.
        </AppText>
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: spacing.xs, color: colors.text.secondary },
  form: { marginTop: spacing.xxl, gap: spacing.lg },
  trust: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
  },
  trustIcon: { fontSize: 18 },
  trustText: { flex: 1, color: colors.primary[800] },
});
