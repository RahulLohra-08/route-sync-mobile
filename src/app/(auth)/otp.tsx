import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AnimatedButton from "@/components/common/AnimatedButton";
import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import AppInput from "@/components/inputs/AppInput";

import { validateOtp } from "@/features/auth/auth.validation";
import { colors, spacing } from "@/theme";
import { Alert } from "react-native";

import {
  verifyOtp,
  getCurrentUser,
} from "@/services/auth/auth.service";

import { saveTokens } from "@/services/auth/token.service";

import {
  setUser,
} from "@/features/auth/auth.slice";

import { useAppDispatch } from "@/store/hooks";


export default function OtpScreen() {
  const dispatch = useAppDispatch();

  const { phoneNumber } = useLocalSearchParams<{
    phoneNumber: string;
  }>();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>();

  const handleVerify = async () => {
    const validationError = validateOtp(otp);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);

    try {
      const normalizedOtp = otp.replace(/\D/g, "");

      const tokens = await verifyOtp({
        phoneNumber: phoneNumber ?? "",
        otp: normalizedOtp,
      });

      await saveTokens(
        tokens.accessToken,
        tokens.refreshToken
      );

      const user = await getCurrentUser();

      dispatch(setUser(user));

      if (user.role === "PASSENGER") {
        router.replace("/(passenger)");
        return;
      }

      if (user.role === "DRIVER") {
        router.replace("/(driver)");
        return;
      }

      Alert.alert(
        "Access unavailable",
        "Admin accounts use the RouteSync web dashboard."
      );
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error
      );

      Alert.alert(
        "Verification failed",
        "The OTP could not be verified. Please try again."
      );
    }
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppText variant="h1">Verify your number</AppText>

        <AppText variant="body" style={styles.description}>
          Enter the 6-digit OTP sent to
        </AppText>

        <AppText variant="bodyMedium" style={styles.phone}>
          +91 {phoneNumber}
        </AppText>

        <View style={styles.inputContainer}>
          <AppInput
            label="Verification code"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(value) => {
              setOtp(value.replace(/\D/g, ""));

              if (error) {
                setError(undefined);
              }
            }}
            error={error}
          />
        </View>

        <AnimatedButton title="Verify OTP" onPress={handleVerify} />

        <AppText variant="caption" style={styles.resend}>
          Didn't receive the code? Resend OTP
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.huge,
  },

  description: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },

  phone: {
    marginTop: spacing.xs,
    color: colors.primary[700],
  },

  inputContainer: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },

  resend: {
    textAlign: "center",
    marginTop: spacing.xl,
    color: colors.primary[600],
  },
});
