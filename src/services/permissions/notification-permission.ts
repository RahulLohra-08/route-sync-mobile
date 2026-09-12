import * as Notifications from "expo-notifications";

export async function requestNotificationPermission() {
  const { status, canAskAgain } =
    await Notifications.requestPermissionsAsync();

  return {
    status,
    canAskAgain,
  };
}

export async function checkNotificationPermission() {
  const { status, canAskAgain } =
    await Notifications.getPermissionsAsync();

  return {
    status,
    canAskAgain,
  };
}