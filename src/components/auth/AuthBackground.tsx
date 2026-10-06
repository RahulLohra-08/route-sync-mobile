import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

type Props = {
  /**
   * Optional photo (night city / bus / road).
   * Example: require("@/assets/images/bus-bg.jpg")
   * A dark green overlay is drawn on top so text stays readable.
   */
  image?: ImageSourcePropType;
};

// ---------------------------------------------------------------------------
// Soft glowing orb that drifts up and down
// ---------------------------------------------------------------------------
function Orb({
  size,
  top,
  left,
  color,
  delay = 0,
  duration = 4200,
}: {
  size: number;
  top: number;
  left: number;
  color: string;
  delay?: number;
  duration?: number;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(18, { duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// The signature element: a tilted bus route with stops and a bus that keeps
// travelling along it.
// ---------------------------------------------------------------------------
const ROUTE_WIDTH = W * 1.5;
const STOPS = 6;

function BusRoute({ top }: { top: number }) {
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(ROUTE_WIDTH - 28, {
        duration: 9000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );
  }, []);

  const busStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[
        styles.route,
        {
          top,
          width: ROUTE_WIDTH,
          left: -W * 0.25,
        },
      ]}
    >
      <View style={styles.routeLine} />

      {Array.from({ length: STOPS }).map((_, i) => (
        <View
          key={i}
          style={[styles.stop, { left: (ROUTE_WIDTH / (STOPS - 1)) * i - 5 }]}
        />
      ))}

      <Animated.View style={[styles.bus, busStyle]}>
        <View style={styles.busGlow} />
        <View style={styles.busDot} />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
export default function AuthBackground({ image }: Props) {
  const gradient = image
    ? ([
        "rgba(2,44,34,0.78)",
        "rgba(6,78,59,0.88)",
        "rgba(2,44,34,0.96)",
      ] as const)
    : (["#022C22", "#064E3B", "#065F46"] as const);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {image ? (
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}

      <LinearGradient
        colors={gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Orb size={220} top={-60} left={W * 0.55} color="rgba(52,211,153,0.18)" />
      <Orb
        size={160}
        top={H * 0.28}
        left={-70}
        color="rgba(110,231,183,0.12)"
        delay={600}
        duration={5000}
      />

      <BusRoute top={H * 0.2} />
      <BusRoute top={H * 0.36} />
    </View>
  );
}

const styles = StyleSheet.create({
  route: {
    position: "absolute",
    height: 12,
    justifyContent: "center",
    transform: [{ rotate: "-14deg" }],
    opacity: 0.55,
  },
  routeLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(167,243,208,0.35)",
  },
  stop: {
    position: "absolute",
    top: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#064E3B",
    borderWidth: 2,
    borderColor: "rgba(167,243,208,0.8)",
  },
  bus: {
    position: "absolute",
    left: 0,
    top: -8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  busGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(52,211,153,0.35)",
  },
  busDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
