import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import AppText from "@/components/common/AppText";
import { LiveDot } from "@/components/common/LiveDot";
import { colors, radius, spacing } from "@/theme";

import type {
  TrackingConnectionStatus,
  TripLocationWebSocketMessage,
} from "../tracking.types";

interface LiveBusMapProps {
  location: TripLocationWebSocketMessage | null;
  status: TrackingConnectionStatus;
  /** Shown under the bus number, e.g. route name or driver name. */
  subtitle?: string;
}

const FALLBACK_REGION: Region = {
  // Roughly centers India as a neutral default until the first fix
  // arrives; replace with your service area's default center.
  latitude: 22.9734,
  longitude: 78.6569,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

function isStale(recordedAt: string, thresholdMs = 60_000) {
  return Date.now() - new Date(recordedAt).getTime() > thresholdMs;
}

/**
 * Renders a single bus's live position on a map, plus a small status
 * header (connection state, staleness). Used by both the passenger
 * "Track" tab and the bus detail screen so the two stay visually
 * consistent and share bug fixes.
 */
export function LiveBusMap({ location, status, subtitle }: LiveBusMapProps) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!location) return;

    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
  }, [location?.latitude, location?.longitude]);

  const stale = location ? isStale(location.recordedAt) : false;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : FALLBACK_REGION
        }
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.busNumber}
            description={location.routeCode}
            rotation={location.heading ?? 0}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
          >
            <View style={[styles.busMarker, stale && styles.busMarkerStale]}>
              <Ionicons name="bus" size={18} color={colors.text.inverse} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          {status === "connected" && !stale ? (
            <LiveDot color={colors.map.bus} size={7} />
          ) : (
            <Ionicons
              name={status === "error" ? "warning-outline" : "time-outline"}
              size={16}
              color={colors.text.muted}
            />
          )}

          <AppText variant="bodyMedium" style={styles.busNumber}>
            {location?.busNumber ?? "Waiting for location..."}
          </AppText>
        </View>

        {subtitle && (
          <AppText variant="caption" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}

        <AppText variant="caption" style={styles.meta}>
          {connectionLabel(status, stale, location)}
        </AppText>
      </View>
    </View>
  );
}

function connectionLabel(
  status: TrackingConnectionStatus,
  stale: boolean,
  location: TripLocationWebSocketMessage | null,
): string {
  if (status === "connecting" || status === "idle") {
    return "Connecting to live tracking...";
  }

  if (status === "error") {
    return "Live tracking unavailable - retrying";
  }

  if (!location) {
    return "No GPS data yet for this trip";
  }

  if (stale) {
    return `Last seen ${new Date(location.recordedAt).toLocaleTimeString()} (signal may be lost)`;
  }

  const speedKmh =
    location.speed != null ? Math.round(location.speed * 3.6) : null;

  return speedKmh != null
    ? `Live - ${speedKmh} km/h`
    : `Live - updated ${new Date(location.recordedAt).toLocaleTimeString()}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.background.tertiary,
  },

  busMarker: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.map.bus,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background.primary,
  },

  busMarkerStale: {
    backgroundColor: colors.text.muted,
  },

  statusCard: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  busNumber: {
    color: colors.text.primary,
  },

  subtitle: {
    color: colors.text.secondary,
    marginTop: 2,
  },

  meta: {
    color: colors.text.muted,
    marginTop: 2,
  },
});
