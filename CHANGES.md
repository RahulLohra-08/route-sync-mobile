# RouteSync mobile – Stage 2 redesign handover

Recovery point: git tag `pre-redesign-checkpoint` (exact upload, incl. your uncommitted WIP). Work is on branch `redesign/stage2`.
Backend was inspected only; **no backend file was changed**.

## 1. Verified integration matrix (from the uploaded backend source)
| Feature | Endpoint / destination | Role | Mobile |
|---|---|---|---|
| Session restore | `GET /api/v1/users/me` (NOT `/auth/me`) | any | unchanged |
| Token refresh | `POST /api/v1/auth/refresh {refreshToken}` | public | **new** `token-refresh.ts` |
| Logout | `POST /api/v1/auth/logout {refreshToken}` | public | now called |
| Trips list / detail | `GET /passenger/trips`, `/{id}`, `/route/{routeId}` | PASSENGER | used |
| Tracking snapshot | `GET /passenger/trips/{id}/tracking` (+`locationFresh`) | PASSENGER | **new** (was unused) |
| ETA | `GET /passenger/trips/{id}/eta?stopId=` | PASSENGER | **new** `TripEtaPanel` |
| Routes / stops | `GET /routes/{id}`, `/routes/{id}/stops/active`, `/routes/active`, `/routes/search` | authenticated | used |
| Driver trips + lifecycle | `GET /driver/trips`, `PATCH /{id}/start|complete|cancel` | DRIVER | used |
| GPS | STOMP `SEND /app/trips/{id}/location`; REST `PATCH /driver/trips/{id}/location` | DRIVER, trip IN_PROGRESS | rewritten |
| Live feed | STOMP `SUBSCRIBE /topic/trips/{id}/location` | PASSENGER/DRIVER(own)/ADMIN | rewritten |
| Ack / errors | `/user/queue/location-ack`, `/user/queue/errors` | any | now consumed |
Not in backend (so not built): push notifications/alerts, nearby-bus search, passenger trip history, driver-profile editing.

## 2. Defects found and fixed
1. **Home → bus detail passed `busId`; screen/backend need `tripId`** (every tap would 404).
2. **Driver sent speed in m/s; backend stores/uses km/h** → ETA 3.6× off. Now converted.
3. **Lat/lng not rounded**; backend has `@Digits(fraction=6)` so raw device doubles are likely rejected (by Bean Validation semantics; not run against your DB).
4. "GPS sent" shown on socket hand-off, before server ack; errors were wiped by the next send. Now ack-based; rejection persists until a later confirmation.
5. Refresh token never used; sessions died after 4 h and the socket retried forever. Now single-flight refresh, token refreshed before each WS connect, capped backoff (8 failures → `error` + Retry).
6. STOMP client: callbacks keyed per destination (two screens overwrote each other), Home unmount called global `disconnect()`, dev log printed the Bearer JWT, a server error rejected the connect promise.
7. Axios logged Authorization prefix, request bodies (OTP) and responses (tokens); `otp.tsx` logged OTP + full auth response. Removed.
8. Snapshot fabricated `lastLocationUpdate = new Date()`; old events could overwrite newer ones; `/routes/{id}/buses` destination did not exist. Removed/guarded.
9. Schedule countdown was labelled "Arriving shortly"; relabelled as *scheduled*. Real ETA only from `/eta`.
10. `.env` was tracked in git → untracked, `.env.example` added. Debug raw-WebSocket probe on driver home removed.
11. Dead code deleted (0 importers verified): `tracking.socket.ts` (546 lines), duplicate auth slice, 8 zero-byte placeholder files, dead Bus/Alerts tabs.

## 3. Files (mobile root-relative)
**Created:** `src/features/tracking/tracking.logic.ts`, `health-meta.ts`, `components/{TripTrackingView,TripEtaPanel}.tsx`; `src/components/tracking/{TrackingStatusPill,ConnectionBanner}.tsx`; `src/services/auth/token-refresh.ts`; `src/features/driver/DriverSessionProvider.tsx`, `components/{GpsStatusCard,DriverTripCard}.tsx`; `tests/tracking.logic.test.ts`; `.env.example`; `CHANGES.md`.
**Rewritten:** `services/websocket/stomp-client.ts`, `services/api/api-client.ts`, `services/auth/logout.service.ts`, `features/tracking/{tracking.types,tracking.slice,tracking.service}.ts`, `hooks/{useTripTracking,useDriverLocationBroadcaster}.ts`, `components/LiveBusMap.tsx`; passenger `track`, `trips`, `bus/[id]`, `route/[id]`; driver `_layout`, `index`, `trip`, `history`.
**Modified:** `AnimatedButton` (loading/variant/a11y, backward compatible), `theme/passenger.ts` (palette unified to emerald/navy), `utils/date.ts` + `ETACard` (honest labels), passenger Home (trip.id, no socket teardown, no dead alerts), `DashboardHero` (bell optional), tab layouts, `passenger.api.ts` (+getRouteById), `app-initializer.ts`, `otp.tsx`, `tsconfig.json`, `package.json` (+`test`,`typecheck`, devDep `@types/node`), `.gitignore`.
**Deleted:** see item 11, plus `raw-websocket-test.ts`.
**Inspected, intentionally unchanged:** auth screens/flow, token storage, `/users/me` restore, role navigation, `search.tsx`, profile screens (logout only), permission screens, `app.json`.

## 4. Verification actually run
- `tsc --noEmit`: clean before (baseline) and after.
- `npm test` (node:test): 11/11 pass – ordering guard, freshness, health states, GPS payload (rounding, m/s→km/h), `formatAgo`.
- `expo export --platform android`: bundle built.
- **Not run:** any device/emulator, the live Spring backend, real STOMP connect/reconnect, role-access calls, ESLint (no config exists), iOS. Treat reconnect behaviour as *implemented but unverified end-to-end*.

## 5. Run
```
cp .env.example .env     # set EXPO_PUBLIC_API_URL=http://<LAN-IP>:8080 (WS = same host + /ws)
npm install --legacy-peer-deps
npm run typecheck && npm test
npx expo start
```
**Maps:** Android dev/production builds need a Google Maps API key in app config (`android.config.googleMaps.apiKey`); `app.json` has none, so the map is blank outside Expo Go. Not added because the key is a secret – use `app.config.ts` reading an env var.

## 6. Manual test checklist
Passenger: login → Trips lists real trips → open an IN_PROGRESS trip → pin + "Live" → drag map (follow stops, Recenter appears) → kill driver GPS 30 s ("Signal delayed") → toggle airplane mode (Reconnecting → Offline → Retry) → restore (snapshot refetch, no jump backwards) → pick stop (ETA or backend's reason) → scheduled trip shows "not started".
Driver: Start trip (permission prompt first; double-tap = one request) → GPS card turns green only after ack → park 1 min (stays live via keep-alive) → background app (warning) → deny permission (Open Settings) → complete (confirm) → appears in History. Passenger account must get 403 on `/driver/trips`.

## 7. Known gaps / next
- Foreground-only GPS (no background-location config); a locked phone stops sharing.
- Timestamps are timezone-less server `LocalDateTime`; freshness therefore uses device receive time. Recommend the backend emit UTC/offset.
- No dedicated bus-search/nearby endpoint; no passenger history; no notifications backend.
- Stage 3: backend `/eta` exists and is wired; improve with route-progress/dwell data. Add a mock-STOMP integration test and ESLint.
