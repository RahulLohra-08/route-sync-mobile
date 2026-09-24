import { apiClient } from "@/services/api/api-client";

import type {
  BusResponse,
  RouteResponse,
  StopResponse,
  TripResponse,
} from './passenger.types';

export const passengerApi = {
  getAvailableTrips: async () =>
    (await apiClient.get<TripResponse[]>('/api/v1/passenger/trips')).data,

  getTripById: async (tripId: string) =>
    (await apiClient.get<TripResponse>(`/api/v1/passenger/trips/${tripId}`)).data,

  getTripsByRoute: async (routeId: string) =>
    (await apiClient.get<TripResponse[]>(`/api/v1/passenger/trips/route/${routeId}`)).data,

  getActiveRoutes: async () =>
    (await apiClient.get<RouteResponse[]>('/api/v1/routes/active')).data,

  searchRoutes: async (routeName?: string) =>
    (await apiClient.get<RouteResponse[]>('/api/v1/routes/search', { params: { routeName } })).data,

  getRouteStops: async (routeId: string) =>
    (await apiClient.get<StopResponse[]>(`/api/v1/routes/${routeId}/stops/active`)).data,

  getBusById: async (busId: string) =>
    (await apiClient.get<BusResponse>(`/api/v1/buses/${busId}`)).data,
};
