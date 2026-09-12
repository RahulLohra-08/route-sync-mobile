import * as Location from "expo-location";

export async function requestForegroundLocationPermission() {
  const { status, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  return {
    status,
    canAskAgain,
  };
}

export async function checkForegroundLocationPermission() {
  const { status, canAskAgain } =
    await Location.getForegroundPermissionsAsync();

  return {
    status,
    canAskAgain,
  };
}

export async function requestBackgroundLocationPermission() {
  const { status, canAskAgain } =
    await Location.requestBackgroundPermissionsAsync();

  return {
    status,
    canAskAgain,
  };
}