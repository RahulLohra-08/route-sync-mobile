// Mirrors the backend enums. `as const` objects keep them erasable-syntax safe.

export const TripStatus = {
  SCHEDULED: 'SCHEDULED',
  BOARDING: 'BOARDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

export const RouteStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type RouteStatus = (typeof RouteStatus)[keyof typeof RouteStatus];

export const BusStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type BusStatus = (typeof BusStatus)[keyof typeof BusStatus];

export const BusType = {
  CITY: 'CITY',
  EXPRESS: 'EXPRESS',
  AC: 'AC',
  NON_AC: 'NON_AC',
  ELECTRIC: 'ELECTRIC',
} as const;
export type BusType = (typeof BusType)[keyof typeof BusType];

export const FuelType = {
  DIESEL: 'DIESEL',
  PETROL: 'PETROL',
  ELECTRIC: 'ELECTRIC',
  CNG: 'CNG',
} as const;
export type FuelType = (typeof FuelType)[keyof typeof FuelType];

export const StopStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type StopStatus = (typeof StopStatus)[keyof typeof StopStatus];

