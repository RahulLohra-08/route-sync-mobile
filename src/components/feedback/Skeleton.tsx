import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Pulsing placeholder block. */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 10,
  style,
}: Props) {
  const o = useSharedValue(0.55);

  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.55, { duration: 750 }),
      ),
      -1,
      false,
    );
  }, [o]);

  const animated = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: "#DDE2EA" },
        animated,
        style,
      ]}
    />
  );
}
