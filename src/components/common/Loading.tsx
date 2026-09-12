import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/theme";

interface LoadingProps {
  fullScreen?: boolean;
}

export default function Loading({
  fullScreen = false,
}: LoadingProps) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
      ]}
    >
      <ActivityIndicator
        size="large"
        color={colors.primary[600]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});