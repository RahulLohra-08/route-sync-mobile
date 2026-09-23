export type BusStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE";

export type BusType =
  | "CITY"
  | "EXPRESS"
  | "AC"
  | "NON_AC"
  | "ELECTRIC";

export type FuelType =
  | "DIESEL"
  | "CNG"
  | "ELECTRIC"
  | "HYBRID";

export type TripStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RouteStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export type StopStatus =
  | "ACTIVE"
  | "INACTIVE";