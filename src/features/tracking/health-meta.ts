// src/features/tracking/health-meta.ts
// One place that defines how every tracking health state LOOKS and READS, so
// passenger map, bus detail and driver dashboard always agree.
import { colors } from "@/theme";
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { TrackingHealth } from "./tracking.types";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface HealthMeta {
  label: string;
  detail: string;
  color: string; // text / dot
  bg: string; // pill / banner background
  icon: IconName;
  /** Pulse the dot (only for genuinely live data). */
  pulse: boolean;
}

export const HEALTH_META: Record<TrackingHealth, HealthMeta> = {
  live: {
    label: "Live",
    detail: "Receiving live GPS from the bus.",
    color: colors.primary[700],
    bg: colors.primary[50],
    icon: "radio-outline",
    pulse: true,
  },
  stale: {
    label: "Signal delayed",
    detail: "No fresh GPS for a while. Showing the last known position.",
    color: "#B45309",
    bg: "#FEF3C7",
    icon: "time-outline",
    pulse: false,
  },
  "no-signal": {
    label: "No GPS yet",
    detail: "The driver has not shared a location for this trip yet.",
    color: "#475569",
    bg: "#F1F5F9",
    icon: "location-outline",
    pulse: false,
  },
  connecting: {
    label: "Connecting",
    detail: "Connecting to live tracking...",
    color: "#475569",
    bg: "#F1F5F9",
    icon: "sync-outline",
    pulse: false,
  },
  reconnecting: {
    label: "Reconnecting",
    detail: "Connection lost. Reconnecting to live tracking...",
    color: "#B45309",
    bg: "#FEF3C7",
    icon: "sync-outline",
    pulse: false,
  },
  offline: {
    label: "Offline",
    detail: "Can't reach live tracking. Still retrying in the background.",
    color: "#B45309",
    bg: "#FEF3C7",
    icon: "cloud-offline-outline",
    pulse: false,
  },
  error: {
    label: "Unavailable",
    detail: "Live tracking could not connect.",
    color: colors.status.error,
    bg: "#FEF2F2",
    icon: "warning-outline",
    pulse: false,
  },
  ended: {
    label: "Trip ended",
    detail: "This trip is no longer running.",
    color: "#475569",
    bg: "#F1F5F9",
    icon: "checkmark-circle-outline",
    pulse: false,
  },
};
