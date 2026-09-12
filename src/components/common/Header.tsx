import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "./AppText";
import {
  colors,
  spacing,
  typography,
} from "@/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  onBackPress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable
          onPress={onBackPress}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text.primary}
          />
        </Pressable>
      )}

      <View>
        <AppText variant="h2">{title}</AppText>

        {subtitle && (
          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },

  backButton: {
    marginRight: spacing.md,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
});