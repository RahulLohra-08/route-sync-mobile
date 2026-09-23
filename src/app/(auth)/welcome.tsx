import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/common/AppText";

import AuthBackground from "@/components/auth/AuthBackground";
import RouteSyncLogo from "@/components/auth/RouteSyncLogo";
import { useAppSelector } from "@/store/hooks";
import { animation, colors, radius, spacing } from "@/theme";

const FEATURES = [
  { icon: "📍", label: "Live location" },
  { icon: "⏱️", label: "AI arrival times" },
  { icon: "🧭", label: "Smart routes" },
];

const spring = (delay: number) => ({
  delay,
  damping: animation.spring.damping,
  stiffness: animation.spring.stiffness,
});

function LivePill() {
  const dot = useSharedValue(1);

  useEffect(() => {
    dot.value = withRepeat(withTiming(0.25, { duration: 800 }), -1, true);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.value }));

  return (
    <View style={styles.pill}>
      <Animated.View style={[styles.pillDot, dotStyle]} />
      <Text style={styles.pillText}>Buses moving now</Text>
    </View>
  );
}

function CtaButton({ title, onPress }: { title: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          (scale.value = withSpring(animation.scale.pressed, animation.spring))
        }
        onPressOut={() =>
          (scale.value = withSpring(animation.scale.normal, animation.spring))
        }
        style={styles.cta}
      >
        <Text style={styles.ctaText}>{title}</Text>
        <Text style={styles.ctaArrow}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Wait until the saved session has been restored.
    if (!isInitialized) return;

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
          router.replace("/(passenger)/(tabs)");
          break;
        default:
          break;
      }
    }
  }, [isInitialized, isAuthenticated, user]);

  if (!isInitialized) return null;
  if (isAuthenticated && user) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Pass your own photo here: */}
      <AuthBackground image={require("@/assets/images/bus-bg.jpg")} />
      {/* <AuthBackground /> */}

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.section,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Animated.View
            entering={ZoomIn.springify().damping(14).stiffness(140)}
          >
            <RouteSyncLogo
              size={96}
              source={require("@/assets/images/logo1.png")}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.springify()
              .damping(animation.spring.damping)
              .stiffness(animation.spring.stiffness)
              .delay(250)}
          >
            <AppText variant="display" style={styles.title}>
              RouteSync
            </AppText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.springify()
              .damping(animation.spring.damping)
              .stiffness(animation.spring.stiffness)
              .delay(380)}
          >
            <AppText variant="body" style={styles.subtitle}>
              Know exactly when your bus arrives.{"\n"}Live, not scheduled.
            </AppText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.springify()
              .damping(animation.spring.damping)
              .stiffness(animation.spring.stiffness)
              .delay(500)}
          >
            <LivePill />
          </Animated.View>
        </View>

        {/* Bottom */}
        <View>
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.label}
                entering={FadeInUp.springify()
                  .damping(animation.spring.damping)
                  .stiffness(animation.spring.stiffness)
                  .delay(650 + i * 90)}
                style={styles.feature}
              >
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInUp.springify()
              .damping(animation.spring.damping)
              .stiffness(animation.spring.stiffness)
              .delay(950)}
          >
            <CtaButton
              title="Get started"
              onPress={() => router.push("/(auth)/login")}
            />

            <AppText variant="caption" style={styles.footer}>
              Track • Understand • Predict • Recommend
            </AppText>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#022C22" },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },

  hero: { alignItems: "center", gap: spacing.lg },
  title: {
    color: colors.text.inverse,
    textAlign: "center",
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.primary[100],
    textAlign: "center",
    fontSize: 18,
    lineHeight: 28,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[400],
  },
  pillText: { color: colors.primary[50], fontSize: 13, fontWeight: "600" },

  features: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  feature: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  featureIcon: { fontSize: 22 },
  featureLabel: {
    color: colors.primary[50],
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  cta: {
    height: 58,
    borderRadius: radius.xl,
    backgroundColor: colors.background.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaText: {
    color: colors.primary[800],
    fontSize: 17,
    fontWeight: "700",
  },
  ctaArrow: {
    color: colors.primary[600],
    fontSize: 26,
    lineHeight: 28,
    marginTop: -2,
  },

  footer: {
    textAlign: "center",
    color: colors.primary[200],
    opacity: 0.8,
    marginTop: spacing.lg,
  },
});
