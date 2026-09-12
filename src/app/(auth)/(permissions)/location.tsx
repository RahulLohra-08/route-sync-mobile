import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import PermissionCard from "@/components/permissions/PermissionCard";
import { requestForegroundLocationPermission } from "@/services/permissions/location-permission";
import { spacing } from "@/theme";

export default function LocationPermissionScreen() {
  const handleAllow = async () => {
    try {
      const result = await requestForegroundLocationPermission();

      if (result.status === "granted") {
        router.replace("/(passenger)");
        return;
      }

      if (!result.canAskAgain) {
        Alert.alert(
          "Location permission required",
          "Please enable location permission from your phone settings."
        );
        return;
      }

      Alert.alert(
        "Location permission needed",
        "RouteSync uses your location to show nearby buses and accurate arrival information."
      );
    } catch (error) {
      console.error("Location permission error:", error);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <PermissionCard
          title="Enable location"
          description="RouteSync uses your location to show nearby buses, stops and real-time arrival information."
          buttonTitle="Allow location"
          onAllow={handleAllow}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});