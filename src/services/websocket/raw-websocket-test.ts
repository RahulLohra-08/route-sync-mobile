import { ENV } from "@/config/env";
import { getAccessToken } from "../auth/token.service";

/**
 * Low-level raw-WebSocket debugging helper - NOT part of the app's
 * real STOMP client (see stomp-client.ts for that).
 *
 * IMPORTANT: if you see the backend log
 *   "Incomplete frame, resetting input buffer..."
 * that is NOT a backend bug. React Native's WebSocket implementation
 * has a documented bug where a NUL byte ("\0") inside a *string*
 * frame gets dropped or mangled crossing the JS<->Native bridge -
 * https://github.com/stomp-js/stompjs/issues/89. Since every STOMP
 * frame must end in a NUL terminator, a string-based send() like
 * `ws.send(frame)` below will intermittently (or always, depending on
 * RN/Hermes version) arrive at the server without it, and the STOMP
 * decoder will wait forever for a frame that never completes -
 * exactly the log line above.
 *
 * The real client (stomp-client.ts) avoids this entirely via
 * @stomp/stompjs's `forceBinaryWSFrames` + `appendMissingNULLonIncoming`
 * options, which are the documented fix for this exact bug. This raw
 * test function demonstrates the same fix manually by sending the
 * frame as a binary Uint8Array instead of a string.
 */
function encodeStompFrame(frame: string): Uint8Array {
  // TextEncoder is required for this workaround. Modern Hermes
  // (bundled with recent Expo SDKs) provides it globally; if you see
  // "TextEncoder is not defined", add the `text-encoding` polyfill
  // package and import it once at your app's entry point.
  return new TextEncoder().encode(frame);
}


export async function testRawWebSocket() {
  console.log("[RAW WS] Connecting to:", ENV.WS_URL);
  const ws = new WebSocket(ENV.WS_URL);

  const token = await getAccessToken();
    
  console.log("Auth token exists for socket:", !!token);

  ws.onopen = async() => {
    console.log("[RAW WS] ✅ OPEN");

    const frame =
      "CONNECT\n" +
      "accept-version:1.2\n" +
      "host:localhost\n" +
      `Authorization:Bearer ${token}\n` +
      "\n" +
      "\0";

    console.log(
      "[RAW WS] CONNECT:",
      JSON.stringify(frame)
    );

    ws.send(encodeStompFrame(frame));

    console.log(
      "[RAW WS] ✅ STOMP CONNECT SENT"
    );
  };

  ws.onmessage = (event) => {
    console.log(
      "[RAW WS] 📩 MESSAGE:",
      JSON.stringify(event.data)
    );
  };

  ws.onerror = (event) => {
    console.error(
      "[RAW WS] ❌ ERROR:",
      event
    );
  };

  ws.onclose = (event) => {
    console.log(
      "[RAW WS] 🔴 CLOSED:",
      event.code,
      event.reason
    );
  };

  return ws;
}