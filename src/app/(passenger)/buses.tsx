// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const buses = () => {
//   return (
//     <View>
//       <Text>buses</Text>
//     </View>
//   )
// }

// export default buses

// const styles = StyleSheet.create({})




import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ETACard from "@/components/cards/ETACard";
import BottomNavigation from "@/components/common/BottomNavigation";

const BLUE = "#208AEF";

const buses = [
  {
    id: "Route 12A",
    route: "Ranchi → Bagodar",
    arrival: "6 min",
    status: "On Time",
  },
  {
    id: "Route 78",
    route: "Ranchi → Jamshedpur",
    arrival: "18 min",
    status: "Delayed 7 min",
  },
  {
    id: "Route 9",
    route: "Bagodar → Ranchi",
    arrival: "25 min",
    status: "On Time",
  },
  {
    id: "Route 15C",
    route: "Ranchi → Dhanbad",
    arrival: "42 min",
    status: "Delayed 12 min",
  },
];

export default function LiveBusesScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Live Buses
        </Text>

        <Text style={styles.headerSubtitle}>
          Track currently running buses
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Location */}
        <TouchableOpacity style={styles.locationCard}>
          <Ionicons
            name="location"
            size={20}
            color={BLUE}
          />

          <View style={styles.locationContent}>
            <Text style={styles.smallText}>
              Your location
            </Text>

            <Text style={styles.locationText}>
              Suriya Road, Bagodar
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#888"
          />
        </TouchableOpacity>

        {/* Filter */}
        <View style={styles.filterRow}>

          <TouchableOpacity
            style={styles.activeFilter}
          >
            <Text style={styles.activeFilterText}>
              All Buses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>
              On Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>
              Delayed
            </Text>
          </TouchableOpacity>

        </View>

  <ETACard
  busNumber="JSR-101"
  arrivalTime="6 min"
  from="Sakchi"
  to="Mango"
  delay="2 min delay"
  />

        {/* Bus list */}
        <Text style={styles.sectionTitle}>
          Running Buses
        </Text>

        {buses.map((bus) => (
          <TouchableOpacity
            key={bus.id}
            style={styles.busCard}
          >

            <View style={styles.busIcon}>
              <Ionicons
                name="bus"
                size={22}
                color={BLUE}
              />
            </View>

            <View style={styles.busInfo}>

              <Text style={styles.busName}>
                {bus.id}
              </Text>

              <Text style={styles.route}>
                {bus.route}
              </Text>

              <Text
                style={[
                  styles.status,
                  bus.status.includes("Delayed")
                    ? styles.delayed
                    : styles.onTime,
                ]}
              >
                {bus.status}
              </Text>

            </View>

            <View style={styles.arrival}>
              <Text style={styles.arrivalLabel}>
                Arriving
              </Text>

              <Text style={styles.arrivalTime}>
                {bus.arrival}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#999"
            />

          </TouchableOpacity>
        ))}

      </ScrollView>
        <BottomNavigation/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  header: {
    backgroundColor: BLUE,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#EAF5FF",
    fontSize: 13,
    marginTop: 5,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  locationContent: {
    flex: 1,
    marginLeft: 10,
  },

  smallText: {
    color: "#999",
    fontSize: 11,
  },

  locationText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  activeFilter: {
    backgroundColor: BLUE,
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 9,
    marginRight: 8,
  },

  activeFilterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  filter: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 9,
    marginRight: 8,
  },

  filterText: {
    color: "#666",
    fontSize: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  busIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#EAF5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  busInfo: {
    flex: 1,
    marginLeft: 12,
  },

  busName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  route: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  status: {
    fontSize: 11,
    marginTop: 5,
    fontWeight: "600",
  },

  onTime: {
    color: "#20B26B",
  },

  delayed: {
    color: "#FF4D4D",
  },

  arrival: {
    alignItems: "flex-end",
    marginRight: 8,
  },

  arrivalLabel: {
    fontSize: 10,
    color: "#999",
  },

  arrivalTime: {
    fontSize: 16,
    fontWeight: "700",
    color: BLUE,
    marginTop: 3,
  },
});