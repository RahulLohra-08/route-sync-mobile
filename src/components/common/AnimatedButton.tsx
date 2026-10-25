import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { animation, colors, radius, spacing, typography } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "danger";

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /**
   * While true the button shows a spinner and ignores presses, which is what
   * prevents double-tap duplicate requests (start/complete trip, etc.).
   */
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const VARIANT: Record<
  ButtonVariant,
  { bg: string; fg: string; border?: string }
> = {
  primary: { bg: colors.primary[600], fg: colors.text.inverse },
  secondary: {
    bg: colors.background.primary,
    fg: colors.primary[700],
    border: colors.border.medium,
  },
  danger: {
    bg: colors.background.primary,
    fg: colors.status.error,
    border: "#FECACA",
  },
};

export default function AnimatedButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  accessibilityHint,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const inactive = disabled || loading;
  const palette = VARIANT[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPressIn={() => {
        scale.value = withSpring(animation.scale.pressed, {
          damping: animation.spring.damping,
          stiffness: animation.spring.stiffness,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(animation.scale.normal, {
          damping: animation.spring.damping,
          stiffness: animation.spring.stiffness,
        });
      }}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: palette.bg,
          borderWidth: palette.border ? 1.5 : 0,
          borderColor: palette.border,
        },
        inactive && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.text, { color: palette.fg }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    ...typography.button,
  },
});
