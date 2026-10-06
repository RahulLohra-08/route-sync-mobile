import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuthBackground from "@/components/auth/AuthBackground";
import RouteSyncLogo from "@/components/auth/RouteSyncLogo";
import AppText from "@/components/common/AppText";

import { animation, colors, radius, spacing } from "@/theme";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  backgroundImage?: any;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  onBack,
  backgroundImage,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AuthBackground image={backgroundImage} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View
            style={[styles.header, { paddingTop: insets.top + spacing.md }]}
          >
            <View style={styles.topRow}>
              {onBack ? (
                <Animated.View entering={FadeIn.delay(100)}>
                  <Pressable
                    onPress={onBack}
                    hitSlop={12}
                    style={({ pressed }) => [
                      styles.back,
                      pressed && {
                        opacity: 0.7,
                        transform: [{ scale: animation.scale.pressed }],
                      },
                    ]}
                  >
                    <Text style={styles.backIcon}>‹</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <View style={styles.back} />
              )}

              <RouteSyncLogo
                size={52}
                pulse={false}
                source={require("@/assets/images/logo1.png")}
              />

              {/* spacer keeps logo centred */}
              <View style={styles.back} />
            </View>

            <Animated.View
              entering={FadeInDown.delay(150)
                .springify()
                .damping(animation.spring.damping)
                .stiffness(animation.spring.stiffness)}
              style={styles.titleBlock}
            >
              <AppText variant="h1" style={styles.title}>
                {title}
              </AppText>
              <AppText variant="body" style={styles.subtitle}>
                {subtitle}
              </AppText>
            </Animated.View>
          </View>

          {/* Sheet */}
          <Animated.View
            entering={SlideInDown.delay(200)
              .springify()
              .damping(animation.spring.damping)
              .stiffness(animation.spring.stiffness)
              .mass(animation.spring.mass)}
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.xxl },
            ]}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#022C22" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: colors.text.inverse,
    fontSize: 30,
    lineHeight: 34,
    marginTop: -2,
    backgroundColor: "transparent",
  },

  titleBlock: { marginTop: spacing.xxl },
  title: { color: colors.text.inverse },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.primary[100],
    opacity: 0.9,
  },

  sheet: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radius.xxl + 8,
    borderTopRightRadius: radius.xxl + 8,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
});
