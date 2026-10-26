import { useDriverSession } from "@/features/driver/DriverSessionProvider";
import { ProfileScreen } from "@/features/profile/ProfileScreen";

/** Driver profile = shared profile + the vehicle/route from the real assigned trip. */
export default function DriverProfile() {
  const { activeTrip, nextTrip } = useDriverSession();
  const trip = activeTrip ?? nextTrip;
  return (
    <ProfileScreen
      role="DRIVER"
      extraTitle="Current assignment"
      extraRows={
        trip
          ? [
              {
                icon: "bus-outline",
                label: "Bus",
                value: `${trip.busNumber} (${trip.registrationNumber})`,
              },
              {
                icon: "map-outline",
                label: "Route",
                value: `${trip.routeCode} · ${trip.routeName}`,
              },
            ]
          : [{ icon: "bus-outline", label: "Bus", value: "None assigned" }]
      }
    />
  );
}
