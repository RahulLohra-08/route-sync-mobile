import React from "react";
import {
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

import {
  animation,
  colors,
  radius,
  spacing,
  typography,
} from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function AnimatedButton({
  title,
  onPress,
  disabled = false,
  style,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
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
      style={[styles.button, animatedStyle, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: colors.text.inverse,
    ...typography.button,
  },
});