import AppText from "@/components/common/AppText";
import Screen from "@/components/common/Screen";
import { testRawWebSocket } from "@/services/websocket/raw-websocket-test";
import { useEffect } from "react";

export default function DriverHome() {
  useEffect(() => {
    let ws: WebSocket | undefined;
    let cancelled = false;

    void testRawWebSocket().then((socket) => {
      if (cancelled) {
        socket.close();
      } else {
        ws = socket;
      }
    });

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, []);

  return (
    <Screen>
      <AppText variant="h1">Driver Dashboard</AppText>

      <AppText variant="body">Welcome to RouteSync Driver.</AppText>
    </Screen>
  );
}
