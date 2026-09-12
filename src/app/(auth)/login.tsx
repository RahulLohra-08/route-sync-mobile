import { StyleSheet, View } from "react-native";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";

export default function LoginScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="h1">
          Welcome back
        </AppText>

        <AppText variant="body" style={styles.subtitle}>
          Login to continue with RouteSync.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 8,
  },
});