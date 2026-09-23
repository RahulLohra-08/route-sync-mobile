import AnimatedButton from "@/components/common/AnimatedButton";
import { logout } from "@/services/auth/logout.service";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const profile = () => {
  async function handleLogout() {
    try {
      await logout();

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <View style={styles.container}>
      <AnimatedButton title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
