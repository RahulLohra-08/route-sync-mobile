// src/features/tracking/components/LiveBusMap.tsx
//
// Map-first live position of ONE bus.
//  * Marker glides between fixes (AnimatedRegion) instead of teleporting.
//  * Camera follows the bus until the user drags the map; then a Recenter
//    button appears. We never fight a user who is exploring.
//  * Marker colour mirrors data freshness (green live / amber stale).
//  * Honors the OS "reduce motion" setting.
import type { StopResponse } from "@/features/passenger/passenger.types";
import { colors, radius } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import MapView, {
  AnimatedRegion,
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import { useReducedMotion } from "react-native-reanimated";
import type { LocationFix, TrackingHealth } from "../tracking.types";

interface Props {
  fix: LocationFix | null;
  health: TrackingHealth;
  following: boolean;
  onFollowingChange: (following: boolean) => void;
  /** Route stops (real lat/lng from the backend). Plain pins, no invented route line. */
  stops?: StopResponse[] | null;
  selectedStopId?: string | null;
  /** Height covered by the bottom sheet, so the map re-centres above it. */
  bottomInset?: number;
}

// Neutral wide view of India until the first REAL fix arrives. No marker is
// drawn without a fix: we never display an invented bus position.
const FALLBACK_REGION: Region = {
  latitude: 22.9734,
  longitude: 78.6569,
  latitudeDelta: 12,
  longitudeDelta: 12,
};
const FOLLOW_ZOOM = 16;
const MARKER_GLIDE_MS = 900;
const CAMERA_MS = 600;

export function LiveBusMap({
  fix,
  health,
  following,
  onFollowingChange,
  stops,
  selectedStopId,
  bottomInset = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const mapRef = useRef<MapView | null>(null);
  const animated = useRef(
    new AnimatedRegion({
      latitude: fix?.latitude ?? FALLBACK_REGION.latitude,
      longitude: fix?.longitude ?? FALLBACK_REGION.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const hadFix = useRef(!!fix);
  const stale = health !== "live";

  // Custom marker views must be tracked briefly after they change, then frozen
  // (tracksViewChanges=false) so the map doesn't re-render them every frame.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    setTracksViewChanges(true);
    const id = setTimeout(() => setTracksViewChanges(false), 400);
    return () => clearTimeout(id);
  }, [stale]);

  // Move marker (+ camera when following) on every NEW coordinate.
  useEffect(() => {
    if (!fix) return;
    const target = { latitude: fix.latitude, longitude: fix.longitude };

    if (!hadFix.current || reduceMotion) {
      animated.setValue({ ...target, latitudeDelta: 0, longitudeDelta: 0 });
    } else {
      animated
        .timing({
          ...target,
          latitudeDelta: 0,
          longitudeDelta: 0,
          duration: MARKER_GLIDE_MS,
          useNativeDriver: false,
          // react-native-maps' typings demand `toValue`, but its runtime
          // overrides it per-axis from latitude/longitude. Unused, so 0.
          toValue: 0,
        })
        .start();
    }
    hadFix.current = true;

    if (following) {
      mapRef.current?.animateCamera(
        { center: target, zoom: FOLLOW_ZOOM },
        { duration: reduceMotion ? 0 : CAMERA_MS },
      );
    }
  }, [fix?.latitude, fix?.longitude, following, reduceMotion, animated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Picking a stop: show bus + that stop together (stop following so the
  // camera doesn't snap back on the next GPS frame).
  useEffect(() => {
    const stop = stops?.find((s) => s.id === selectedStopId);
    if (!stop) return;
    onFollowingChange(false);
    const coords = [{ latitude: stop.latitude, longitude: stop.longitude }];
    if (fix) coords.push({ latitude: fix.latitude, longitude: fix.longitude });
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 140, right: 60, bottom: bottomInset + 60, left: 60 },
      animated: !reduceMotion,
    });
  }, [selectedStopId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markerColor = stale ? "#F59E0B" : colors.map.bus;
  // Typing bridge: AnimatedRegion is the documented value for Marker.Animated,
  // but the library's d.ts expects a plain LatLng-shaped object.
  const animatedCoordinate = animated as unknown as ComponentProps<
    typeof Marker.Animated
  >["coordinate"];

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        // Apple Maps needs no key on iOS; Google on Android needs the API key
        // (see README "Maps configuration").
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={
          fix
            ? {
                latitude: fix.latitude,
                longitude: fix.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : FALLBACK_REGION
        }
        mapPadding={{ top: 0, right: 0, bottom: bottomInset, left: 0 }}
        toolbarEnabled={false}
        showsCompass={false}
        rotateEnabled={false}
        // Any manual drag = the user is exploring; stop following.
        onPanDrag={() => following && onFollowingChange(false)}
      >
        {fix &&
          fix.accuracy != null &&
          fix.accuracy > 0 &&
          fix.accuracy < 200 && (
            <Circle
              center={{ latitude: fix.latitude, longitude: fix.longitude }}
              radius={fix.accuracy}
              strokeColor="transparent"
              fillColor={
                stale ? "rgba(245,158,11,0.12)" : "rgba(5,150,105,0.12)"
              }
            />
          )}
        {stops?.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={`${stop.stopOrder}. ${stop.stopName}`}
            pinColor={
              stop.id === selectedStopId ? colors.primary[700] : "#94A3B8"
            }
            zIndex={stop.id === selectedStopId ? 2 : 1}
          />
        ))}
        {fix && (
          <Marker.Animated
            coordinate={animatedCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            rotation={fix.heading ?? 0}
            tracksViewChanges={tracksViewChanges}
            title={fix.busNumber ?? undefined}
            description={fix.routeCode ?? undefined}
          >
            <View style={[styles.marker, { backgroundColor: markerColor }]}>
              <Ionicons name="bus" size={18} color={colors.text.inverse} />
            </View>
          </Marker.Animated>
        )}
      </MapView>

      {fix && !following && (
        <Pressable
          onPress={() => onFollowingChange(true)}
          accessibilityRole="button"
          accessibilityLabel="Recenter map on the bus"
          style={[styles.recenter, { bottom: bottomInset + 16 }]}
        >
          <Ionicons name="locate" size={22} color={colors.primary[700]} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  recenter: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
