const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured."
  );
}

export const ENV = {
  API_URL,
  WS_URL: API_URL.replace(/^http/, "ws") + "/ws",
};