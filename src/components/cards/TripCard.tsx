import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type TripCardProps = {
  tripName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  busNumber?: string;
  onPress?: () => void;
};

export default function TripCard({
  tripName,
  from,
  to,
  date,
  time,
  status,
  busNumber,
  onPress,
}: TripCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.tripLabel}>Trip</Text>
          <Text style={styles.tripName}>{tripName}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            status === "Upcoming" && styles.upcoming,
            status === "Completed" && styles.completed,
            status === "Cancelled" && styles.cancelled,
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.location}>
          <View style={styles.greenDot} />

          <View>
            <Text style={styles.label}>From</Text>
            <Text style={styles.locationText}>{from}</Text>
          </View>
        </View>

        <View style={styles.line} />

        <View style={styles.location}>
          <View style={styles.redDot} />

          <View>
            <Text style={styles.label}>To</Text>
            <Text style={styles.locationText}>{to}</Text>
          </View>
        </View>
      </View>

      {/* Trip details */}
      <View style={styles.details}>
        <View>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <View>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time}</Text>
        </View>

        {busNumber && (
          <View>
            <Text style={styles.label}>Bus</Text>
            <Text style={styles.value}>{busNumber}</Text>
          </View>
        )}
      </View>

      <Text style={styles.viewText}>View Trip →</Text>
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

  tripLabel: {
    fontSize: 11,
    color: "#888888",
  },

  tripName: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  upcoming: {
    backgroundColor: "#E0F2FE",
  },

  completed: {
    backgroundColor: "#DCFCE7",
  },

  cancelled: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  routeContainer: {
    marginBottom: 16,
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    marginRight: 12,
  },

  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 12,
  },

  line: {
    height: 18,
    width: 1,
    backgroundColor: "#D1D5DB",
    marginLeft: 4.5,
  },

  label: {
    fontSize: 11,
    color: "#888888",
  },

  locationText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 14,
  },

  value: {
    fontSize: 13,
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