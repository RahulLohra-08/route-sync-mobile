import React from "react";
import { View, Text, StyleSheet } from "react-native";

type ETACardProps = {
  busNumber: string;
  arrivalTime: string;
  from: string;
  to: string;
  delay?: string;
};

export default function ETACard({
  busNumber,
  arrivalTime,
  from,
  to,
  delay,
}: ETACardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Estimated Arrival</Text>
          <Text style={styles.time}>{arrivalTime}</Text>
        </View>

        <Text style={styles.bus}>🚌 {busNumber}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.dot} />

        <View>
          <Text style={styles.routeLabel}>From</Text>
          <Text style={styles.location}>{from}</Text>
        </View>
      </View>

      <View style={styles.line} />

      <View style={styles.routeContainer}>
        <View style={styles.destinationDot} />

        <View>
          <Text style={styles.routeLabel}>To</Text>
          <Text style={styles.location}>{to}</Text>
        </View>
      </View>

      {delay && (
        <View style={styles.delayBox}>
          <Text style={styles.delayText}>⚠️ {delay}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: "#777777",
  },

  time: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 3,
  },

  bus: {
    fontSize: 15,
    fontWeight: "700",
  },

  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    marginRight: 12,
  },

  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 12,
  },

  routeLabel: {
    fontSize: 11,
    color: "#888888",
  },

  location: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },

  line: {
    height: 20,
    width: 1,
    backgroundColor: "#CCCCCC",
    marginLeft: 4.5,
  },

  delayBox: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
  },

  delayText: {
    fontSize: 13,
    fontWeight: "600",
  },
});