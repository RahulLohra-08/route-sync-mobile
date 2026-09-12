import { StyleSheet, View } from "react-native";

import AppText from "@/components/common/AppText";
import AnimatedButton from "@/components/common/AnimatedButton";
import { colors, radius, spacing } from "@/theme";

interface PermissionCardProps {
  title: string;
  description: string;
  buttonTitle: string;
  onAllow: () => void;
}

export default function PermissionCard({
  title,
  description,
  buttonTitle,
  onAllow,
}: PermissionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <AppText variant="h2">📍</AppText>
      </View>

      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" style={styles.description}>
        {description}
      </AppText>

      <AnimatedButton
        title={buttonTitle}
        onPress={onAllow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xxl,
    borderRadius: radius.xxl,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },

  title: {
    marginBottom: spacing.sm,
  },

  description: {
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
  },
});