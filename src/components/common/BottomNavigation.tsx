import React from "react";
import {
  View,   
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BLUE = "#2563EB";

export default function BottomNavigation(){
    
        const router = useRouter();
return(
<View style={styles.bottomNav}>


        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="home"
            size={23}
            color={BLUE}
          />

          <Text style={[styles.navText, styles.activeNavText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={()=>router.push("/(passenger)/buses")}
        >
          <Ionicons
            name="bus"
            size={23}
            color="#888"
          />

          <Text style={styles.navText}>
            Live Buses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>router.push("/(passenger)/map")}
        >
          <Ionicons
            name="map-outline"
            size={23}
            color="#888"
          />

          <Text style={styles.navText}>
            Map
          </Text>
        </TouchableOpacity>

         <TouchableOpacity
          style={styles.navItem}
          onPress={() =>router.push("/(passenger)/RoutesScreen")}
        >
          <Ionicons
            name="heart-outline"
            size={23}
            color="#888"
          />

          <Text style={styles.navText}>
            My Routes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(passenger)/profile")}
        >
          <Ionicons
            name="person-outline"
            size={23}
            color="#888"
          />

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>
)
}

const styles = StyleSheet.create({
 bottomNav: {
    height: 70,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  navText: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },

  activeNavText: {
    color: BLUE,
    fontWeight: "600",
  },
});
