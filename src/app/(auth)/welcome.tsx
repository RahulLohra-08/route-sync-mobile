import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AnimatedButton from "@/components/common/AnimatedButton";

import { colors, spacing } from "@/theme";
import { useAppSelector } from "@/store/hooks";

export default function WelcomeScreen() {
  const {
    user,
    isAuthenticated,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Don't make any navigation decision
    // until authentication restoration finishes.
    if (!isInitialized) {
      return;
    }

    // -----------------------------------------
    // Authenticated user
    // -----------------------------------------

    if (isAuthenticated && user) {
      switch (user.role) {
        case "PASSENGER":
          router.replace("/(passenger)/(tabs)");
          break;

        case "DRIVER":
          router.replace("/(driver)/(tabs)");
          break;

        case "ADMIN":
          // Mobile app should normally not handle ADMIN.
          // Change this route if you later add admin mobile.
          router.replace("/(passenger)/(tabs)");
          break;

        default:
          break;
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    user,
  ]);

  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  // -----------------------------------------
  // Authentication restoration
  // -----------------------------------------

  if (!isInitialized) {
    return null;
  }

  // -----------------------------------------
  // Authenticated user
  // -----------------------------------------

  if (isAuthenticated && user) {
    return null;
  }

  // -----------------------------------------
  // Unauthenticated user
  // -----------------------------------------

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <AppText
            variant="display"
            style={styles.logo}
          >
            🚌
          </AppText>
        </View>

        <AppText
          variant="display"
          style={styles.title}
        >
          RouteSync
        </AppText>

        <AppText
          variant="body"
          style={styles.subtitle}
        >
          Smart public transport,
          {"\n"}
          connected in real time.
        </AppText>

        <View style={styles.spacer} />

        <AnimatedButton
          title="Get Started"
          onPress={handleGetStarted}
        />

        <AppText
          variant="caption"
          style={styles.footer}
        >
          Track • Understand • Predict • Recommend
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.xxxl,
  },

  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.huge,
  },

  logo: {
    fontSize: 44,
  },

  title: {
    marginTop: spacing.xl,
    color: colors.primary[700],
  },

  subtitle: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 18,
    lineHeight: 28,
  },

  spacer: {
    flex: 1,
  },

  footer: {
    textAlign: "center",
    color: colors.text.muted,
    marginTop: spacing.lg,
  },
});