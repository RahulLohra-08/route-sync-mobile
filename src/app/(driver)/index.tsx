import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";

export default function DriverHome() {
  return (
    <Screen>
      <AppText variant="h1">
        Driver Dashboard
      </AppText>

      <AppText variant="body">
        Welcome to RouteSync Driver.
      </AppText>
    </Screen>
  );
}