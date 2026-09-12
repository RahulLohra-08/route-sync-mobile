import { requestForegroundLocationPermission } from "./location-permission";
import { requestNotificationPermission } from "./notification-permission";

export async function requestPassengerPermissions() {
  const location = await requestForegroundLocationPermission();

  const notifications = await requestNotificationPermission();

  return {
    location,
    notifications,
  };
}

export async function requestDriverBasicPermissions() {
  const location = await requestForegroundLocationPermission();

  const notifications = await requestNotificationPermission();

  return {
    location,
    notifications,
  };
}

export async function requestDriverBackgroundLocation() {
  const { requestBackgroundLocationPermission } =
    await import("./location-permission");

  return requestBackgroundLocationPermission();
}