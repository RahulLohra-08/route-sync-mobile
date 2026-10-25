import { TripTrackingView } from "@/features/tracking/components/TripTrackingView";
import { setSelectedTrip } from "@/features/tracking/tracking.slice";
import { useAppDispatch } from "@/store/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * Route param `id` is a TRIP id (live GPS belongs to a trip in this backend:
 * /passenger/trips/{tripId}/tracking, /topic/trips/{tripId}/location).
 * Callers must pass trip.id, never bus.id.
 */
export default function TripTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Remember the followed trip so the Track tab shows the same bus.
  useEffect(() => {
    if (id) dispatch(setSelectedTrip(id));
  }, [id, dispatch]);

  if (!id) return null;
  return (
    <TripTrackingView
      tripId={id}
      onBack={() =>
        router.canGoBack()
          ? router.back()
          : router.replace("/(passenger)/(tabs)")
      }
    />
  );
}
