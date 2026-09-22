import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type RouteCardProps = {
  routeName: string;
  from: string;
  to: string;
  stops: number;
  duration: string;
  distance?: string;
  onPress?: () => void;
};

export default function RouteCard({
  routeName,
  from,
  to,
  stops,
  duration,
  distance,
  onPress,
}: RouteCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.routeLabel}>Route</Text>
          <Text style={styles.routeName}>{routeName}</Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </View>

      {/* From */}
      <View style={styles.locationRow}>
        <View style={styles.greenDot} />

        <View style={styles.locationInfo}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.location}>{from}</Text>
        </View>
      </View>

      {/* Connecting line */}
      <View style={styles.line} />

      {/* To */}
      <View style={styles.locationRow}>
        <View style={styles.redDot} />

        <View style={styles.locationInfo}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.location}>{to}</Text>
        </View>
      </View>

      {/* Route information */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Stops</Text>
          <Text style={styles.infoValue}>{stops}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{duration}</Text>
        </View>

        {distance && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{distance}</Text>
          </View>
        )}
      </View>

      <Text style={styles.viewText}>View Route →</Text>
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
    alignItems: "center",
    marginBottom: 18,
  },

  routeLabel: {
    fontSize: 12,
    color: "#888888",
  },

  routeName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  arrow: {
    fontSize: 24,
    color: "#2589E8",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  greenDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    marginRight: 12,
  },

  redDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#EF4444",
    marginRight: 12,
  },

  locationInfo: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#888888",
  },

  location: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },

  line: {
    height: 18,
    width: 1,
    backgroundColor: "#D1D5DB",
    marginLeft: 5,
  },

  infoRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    marginTop: 16,
    paddingTop: 14,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: "#888888",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  viewText: {
    color: "#2589E8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 15,
  },
});