import {apiClient} from "@/services/api/api-client";

import type {
  RouteResponse,
  StopResponse,
  TripResponse,
} from "./passenger.types";

export async function getActiveRoutes(): Promise<RouteResponse[]> {
  const response = await apiClient.get<RouteResponse[]>(
    "/api/v1/routes/active"
  );

  return response.data;
}

export async function searchRoutes(
  routeName: string
): Promise<RouteResponse[]> {
  const response = await apiClient.get<RouteResponse[]>(
    "/api/v1/routes/search",
    {
      params: {
        routeName,
      },
    }
  );

  return response.data;
}

export async function getRouteById(
  routeId: string
): Promise<RouteResponse> {
  const response = await apiClient.get<RouteResponse>(
    `/api/v1/routes/${routeId}`
  );

  return response.data;
}

export async function getActiveRouteStops(
  routeId: string
): Promise<StopResponse[]> {
  const response = await apiClient.get<StopResponse[]>(
    `/api/v1/routes/${routeId}/stops/active`
  );

  return response.data;
}

export async function getAvailableTrips(): Promise<TripResponse[]> {
  const response = await apiClient.get<TripResponse[]>(
    "/api/v1/passenger/trips"
  );

  return response.data;
}

export async function getTripsByRoute(
  routeId: string
): Promise<TripResponse[]> {
  const response = await apiClient.get<TripResponse[]>(
    `/api/v1/passenger/trips/route/${routeId}`
  );

  return response.data;
}

export async function getTripById(
  tripId: string
): Promise<TripResponse> {
  const response = await apiClient.get<TripResponse>(
    `/api/v1/passenger/trips/${tripId}`
  );

  return response.data;
}