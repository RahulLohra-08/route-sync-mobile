// src/features/buses/busStatus.ts
// Maps backend bus + trip data to ONE honest operational label.
import type { BusResponse, RouteResponse, TripResponse } from "@/features/passenger/passenger.types";

export type BusOperationalState = "live" | "boarding" | "scheduled" | "idle" | "maintenance" | "inactive";

export interface BusEntry {
  bus: BusResponse;
  /** The bus's most relevant non-finished trip, if any (IN_PROGRESS > BOARDING > SCHEDULED). */
  trip: TripResponse | null;
  route: RouteResponse | null;
  state: BusOperationalState;
}

const RANK: Record<string, number> = { IN_PROGRESS: 0, BOARDING: 1, SCHEDULED: 2 };

export function buildBusEntries(
  buses: BusResponse[],
  trips: TripResponse[],
  routesById: Map<string, RouteResponse>,
): BusEntry[] {
  const best = new Map<string, TripResponse>();
  for (const t of trips) {
    if (!(t.status in RANK)) continue;
    const cur = best.get(t.busId);
    if (!cur || RANK[t.status] < RANK[cur.status]) best.set(t.busId, t);
  }
  return buses
    .map<BusEntry>((bus) => {
      const trip = best.get(bus.id) ?? null;
      const state: BusOperationalState =
        bus.status === "MAINTENANCE" ? "maintenance"
        : bus.status === "INACTIVE" ? "inactive"
        : trip?.status === "IN_PROGRESS" ? "live"
        : trip?.status === "BOARDING" ? "boarding"
        : trip ? "scheduled"
        : "idle";
      return { bus, trip, route: trip ? (routesById.get(trip.routeId) ?? null) : null, state };
    })
    // live first, then boarding, scheduled, idle, others; stable by bus number
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.bus.busNumber.localeCompare(b.bus.busNumber));
}

const ORDER: Record<BusOperationalState, number> = { live: 0, boarding: 1, scheduled: 2, idle: 3, maintenance: 4, inactive: 5 };

export const STATE_META: Record<BusOperationalState, { label: string; color: string; bg: string }> = {
  live: { label: "On trip · live", color: "#047857", bg: "#D1FAE5" },
  boarding: { label: "Boarding", color: "#B45309", bg: "#FEF3C7" },
  scheduled: { label: "Trip scheduled", color: "#0F766E", bg: "#CCFBF1" },
  idle: { label: "No active trip", color: "#475569", bg: "#F1F5F9" },
  maintenance: { label: "Maintenance", color: "#B45309", bg: "#FEF3C7" },
  inactive: { label: "Inactive", color: "#475569", bg: "#E2E8F0" },
};

/** Free-text search over fields we really have. */
export function matchesBus(e: BusEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [e.bus.busNumber, e.bus.registrationNumber, e.route?.routeCode, e.route?.routeName, e.route?.startLocation, e.route?.endLocation]
    .some((v) => v?.toLowerCase().includes(q));
}
