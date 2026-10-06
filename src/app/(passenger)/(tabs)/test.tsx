import { testRawWebSocket } from "@/services/websocket/raw-websocket-test";
import { useEffect } from "react";

export default function TestScreen() {
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

  return null;
}
