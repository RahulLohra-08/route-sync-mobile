import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import * as Location from "expo-location";
import {
  Map,
  Camera,
  Marker,
} from "@maplibre/maplibre-react-native";

import RouteCard from "@/components/cards/RouteCard";
import BottomNavigation from "@/components/common/BottomNavigation";

console.log(
  "MapTiler key exists:",
  !!process.env.EXPO_PUBLIC_MAPTILER_KEY
);

export default function MapScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

 useEffect(() => {
  let subscription: Location.LocationSubscription | null = null;

  const startLocationTracking = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return;
    }

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (newLocation) => {
        console.log(
          "Updated location:",
          newLocation.coords.latitude,
          newLocation.coords.longitude
        );

        setLocation(newLocation);
      }
    );
  };

  startLocationTracking();

  return () => {
    subscription?.remove();
  };
}, []);

  const getUserLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      console.log(
        "Passenger location:",
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      setLocation(currentLocation);
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  if (!location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Getting your location...
        </Text>
      </View>
    );
  }

  const { latitude, longitude } = location.coords;

  return (
    <View style={styles.container}>

    <RouteCard
  routeName="Sakchi → Mango"
  from="Sakchi"
  to="Mango"
  stops={8}
  duration="25 min"
  distance="7.2 km"
  onPress={() => {
    console.log("Route selected");
  }}
/>

      <Map
        style={styles.map}
       mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
      >
        <Camera
          initialViewState={{
            center: [longitude, latitude],
            zoom: 12,
          }}
        />

       <Marker
  lngLat={[longitude, latitude]}
  anchor="bottom"
>
  <View style={styles.locationMarker}>
    <View style={styles.locationDot} />
  </View>
</Marker>
      </Map>
      <BottomNavigation/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },

  locationMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(45, 212, 191, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2DD4BF",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});