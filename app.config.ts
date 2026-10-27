// app.config.ts
//
// Extends app.json (everything there is kept as-is) and injects the Google
// Maps API key for ANDROID at build time from an environment variable, so the
// secret never lives in git or in app.json.
//
//   local : put  GOOGLE_MAPS_ANDROID_API_KEY=...  in .env  (git-ignored)
//   EAS   : eas env:create / `eas secret:create` with the same name
//
// NOTE: this value is baked into AndroidManifest.xml at *prebuild* time, so
// after setting or changing it you must rebuild the native app
// (npx expo prebuild --clean && npx expo run:android). A JS reload is not enough.
import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (!googleMapsKey && process.env.EAS_BUILD) {
    // Fail the cloud build early instead of shipping a build with a blank map.
    throw new Error("GOOGLE_MAPS_ANDROID_API_KEY is not set for this EAS build.");
  }

  return {
    ...config,
    name: config.name ?? "route-sync-mobile",
    slug: config.slug ?? "route-sync-mobile",
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: googleMapsKey ? { apiKey: googleMapsKey } : undefined,
      },
    },
  };
};
