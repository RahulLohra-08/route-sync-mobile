import { useEffect } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme";

type Props = {
  size?: number;
  pulse?: boolean;
  /**
   * Your real logo file, e.g. require("@/assets/images/logo.png").
   * If omitted, a bus emoji mark is used.
   */
  source?: ImageSourcePropType;
};

function Ring({ size, delay }: { size: number; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.7 }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size * 0.3 },
        style,
      ]}
    />
  );
}

export default function RouteSyncLogo({
  size = 88,
  pulse = true,
  source,
}: Props) {
  const radius = size * 0.3;

  return (
    <View style={{ width: size, height: size }}>
      {pulse ? (
        <>
          <Ring size={size} delay={0} />
          <Ring size={size} delay={1200} />
        </>
      ) : null}

      <View
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: radius },
        ]}
      >
        {source ? (
          <Image
            source={source}
            style={{ width: size * 0.62, height: size * 0.62 }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: size * 0.5 }}>🚌</Text>
        )}
      </View>

      {/* live indicator */}
      <View
        style={[
          styles.liveBadge,
          {
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: size * 0.13,
            right: -size * 0.04,
            top: -size * 0.04,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  mark: {
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  liveBadge: {
    position: "absolute",
    backgroundColor: colors.primary[400],
    borderWidth: 3,
    borderColor: "#064E3B",
  },
});
