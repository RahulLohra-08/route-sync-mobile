import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type BusCardProps = {
  busNumber: string;
  from: string;
  to: string;
  arrival: string;
  delay?: string;
  onPress?: () => void;
};

export default function BusCard({
  busNumber,
  from,
  to,
  arrival,
  delay,
  onPress,
}: BusCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.busNumber}>🚌 {busNumber}</Text>
        <Text style={styles.live}>● LIVE</Text>
      </View>

      <Text style={styles.route}>
        {from} → {to}
      </Text>

      <Text style={styles.arrival}>
        Arriving in {arrival}
      </Text>

      {delay && (
        <Text style={styles.delay}>
          Delay: {delay}
        </Text>
      )}

      <Text style={styles.details}>
        View Details →
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  busNumber: {
    fontSize: 17,
    fontWeight: "700",
  },

  live: {
    fontSize: 12,
    fontWeight: "700",
  },

  route: {
    fontSize: 15,
    marginTop: 12,
  },

  arrival: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  delay: {
    fontSize: 13,
    marginTop: 4,
  },

  details: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
});