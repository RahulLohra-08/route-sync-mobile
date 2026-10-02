import type { TripStatus } from "@/features/passenger/passenger.enums";

/** Mirrors backend TripResponse (dto/trip/TripResponse.java). */
export interface DriverTripResponse {
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

export interface UpdateTripLocationRequest {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
}
