import { StyleSheet, Text, View } from "react-native";

export default function RouteSyncSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🚌</Text>
      </View>

      <Text style={styles.title}>RouteSync</Text>

      <Text style={styles.tagline}>Smart Public Transport</Text>

      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F7F5",
    marginBottom: 20,
  },

  logo: {
    fontSize: 48,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748B",
    letterSpacing: 0.2,
  },

  loadingContainer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F766E",
    marginBottom: 10,
  },

  loadingText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
