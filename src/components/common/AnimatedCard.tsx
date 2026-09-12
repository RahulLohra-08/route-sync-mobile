import { PropsWithChildren } from "react";
import { StyleSheet, ViewStyle } from "react-native";

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
} from "@/theme";

interface AnimatedCardProps extends PropsWithChildren {
  onPress?: () => void;
  style?: ViewStyle;
}

export default function AnimatedCard({
  children,
  onPress,
  style,
}: AnimatedCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(
      animation.scale.pressed,
      {
        damping: animation.spring.damping,
        stiffness: animation.spring.stiffness,
      }
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(
      animation.scale.normal,
      {
        damping: animation.spring.damping,
        stiffness: animation.spring.stiffness,
      }
    );
  };

  return (
    <Animated.View
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      style={[
        styles.card,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});