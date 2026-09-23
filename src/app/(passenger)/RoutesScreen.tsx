
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import RouteCard from "@/components/cards/RouteCard";
import BottomNavigation from "@/components/common/BottomNavigation";

const BLUE = "#2589E8";

export default function RoutesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Routes</Text>

            <Text style={styles.subtitle}>
              Your saved bus routes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(passenger)/buses")}
          >
            <Ionicons
              name="add"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Saved Routes */}
        <Text style={styles.sectionTitle}>
          Saved Routes
        </Text>

        {/* Route 1 */}
        <RouteCard
          routeName="JSR-101"
          from="Sakchi"
          to="Mango"
          stops={8}
          duration="25 min"
          distance="7.2 km"
          onPress={() => router.push("/(passenger)/map")}
        />

        {/* Route 2 */}
        <RouteCard
          routeName="JSR-102"
          from="Mango"
          to="Sakchi"
          stops={9}
          duration="30 min"
          distance="7.8 km"
          onPress={() => router.push("/(passenger)/map")}
        />

        {/* Route 3 */}
        <RouteCard
          routeName="JSR-105"
          from="Adityapur"
          to="Sakchi"
          stops={6}
          duration="20 min"
          distance="5.4 km"
          onPress={() => router.push("/(passenger)/map")}
        />

        {/* Information */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={BLUE}
          />

          <Text style={styles.infoText}>
            Save your frequently used routes to quickly
            check buses and estimated arrival times.
          </Text>
        </View>

      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0B1220",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 4,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0B1220",
    marginBottom: 12,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
    marginLeft: 10,
  },
});

