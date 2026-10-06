import type {
  BusStatus,
  BusType,
  FuelType,
  RouteStatus,
  StopStatus,
  TripStatus,
} from "./passenger.enums";

export interface BusResponse {
  id: string;
  registrationNumber: string;
  busNumber: string;
  model: string | null;
  manufacturer: string | null;
  capacity: number;
  busType: BusType;
  fuelType: FuelType;
  status: BusStatus;
  yearOfManufacture: number | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationUpdate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteResponse {
  id: string;
  routeCode: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  status: RouteStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StopResponse {
  id: string;
  routeId: string;
  stopName: string;
  address: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedArrivalOffsetMinutes: number;
  status: StopStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripResponse {
  id: string;

  routeId: string;
  routeCode: string;
  routeName: string;

  busId: string;
  busNumber: string;
  registrationNumber: string;

  driverId: string;
  employeeCode: string;
  driverName: string;

  scheduledStartTime: string;
  scheduledEndTime: string;

  actualStartTime: string | null;
  actualEndTime: string | null;

  status: TripStatus;

  totalSeats: number;
  currentOccupancy: number;
  availableSeats: number;

  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationUpdate: string | null;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}