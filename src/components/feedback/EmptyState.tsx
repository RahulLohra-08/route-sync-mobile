import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { PressableScale } from "@/components/common/PressableScale";
import { palette, type IconName } from "@/theme/passenger";

interface Props {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "danger";
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = "neutral",
}: Props) {
  const danger = tone === "danger";
  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.wrap}>
      <Animated.View
        entering={ZoomIn.delay(80).springify().damping(14)}
        style={[
          styles.icon,
          { backgroundColor: danger ? "#FEE4E2" : palette.amberSoft },
        ]}
      >
        <Ionicons
          name={icon}
          size={30}
          color={danger ? palette.danger : "#9A5B00"}
        />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 36, paddingVertical: 36 },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.text,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.body,
    textAlign: "center",
    marginTop: 6,
  },
  button: {
    marginTop: 20,
    backgroundColor: palette.ink,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
