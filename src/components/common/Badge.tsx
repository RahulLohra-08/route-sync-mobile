import { StyleSheet, View } from "react-native";

import AppText from "./AppText";
import {
  colors,
  radius,
  spacing,
} from "@/theme";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles = {
  success: {
    background: colors.primary[50],
    text: colors.primary[700],
  },

  warning: {
    background: "#FFF7ED",
    text: "#C2410C",
  },

  error: {
    background: "#FEF2F2",
    text: colors.status.error,
  },

  info: {
    background: "#EFF6FF",
    text: colors.status.info,
  },
};

export default function Badge({
  label,
  variant = "success",
}: BadgeProps) {
  const current = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: current.background },
      ]}
    >
      <AppText
        variant="caption"
        style={{ color: current.text }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});