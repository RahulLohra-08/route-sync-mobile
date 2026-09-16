import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AnimatedButton from "@/components/common/AnimatedButton";
import { colors, spacing } from "@/theme";

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <AppText variant="display" style={styles.logo}>
            🚌
          </AppText>
        </View>

        <AppText variant="display" style={styles.title}>
          RouteSync
        </AppText>

        <AppText variant="body" style={styles.subtitle}>
          Smart public transport,
          {"\n"}
          connected in real time.
        </AppText>

        <View style={styles.spacer} />

        <AnimatedButton
          title="Get Started"
          onPress={handleGetStarted}
        />

        <AppText variant="caption" style={styles.footer}>
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