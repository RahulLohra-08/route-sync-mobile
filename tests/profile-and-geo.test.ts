import test from "node:test";
import assert from "node:assert/strict";
import { licenseState, validateProfile } from "../src/features/profile/profile.logic.ts";
import { formatDistance, haversineKm } from "../src/features/routes/geo.ts";

const cur = { fullName: "Asha Kumari", email: "asha@example.com" };

test("profile: unchanged form yields no payload (no pointless request)", () => {
  const r = validateProfile({ fullName: " Asha Kumari ", email: "asha@example.com" }, cur);
  assert.equal(r.payload, null);
  assert.deepEqual(r.errors, {});
});
test("profile: only changed fields are sent, trimmed", () => {
  const r = validateProfile({ fullName: "  Asha K  ", email: "asha@example.com" }, cur);
  assert.deepEqual(r.payload, { fullName: "Asha K" });
});
test("profile: mirrors backend limits (name 2-100, valid email, <=150)", () => {
  assert.ok(validateProfile({ fullName: "A", email: "a@b.co" }, cur).errors.fullName);
  assert.ok(validateProfile({ fullName: "x".repeat(101), email: "a@b.co" }, cur).errors.fullName);
  assert.ok(validateProfile({ fullName: "Asha", email: "not-an-email" }, cur).errors.email);
  assert.ok(validateProfile({ fullName: "Asha", email: `${"a".repeat(146)}@b.co` }, cur).errors.email);
});
test("profile: an existing email can't be cleared; a missing one may stay empty", () => {
  assert.ok(validateProfile({ fullName: "Asha", email: "" }, cur).errors.email);
  const r = validateProfile({ fullName: "Asha K", email: "" }, { fullName: "Asha", email: null });
  assert.deepEqual(r.errors, {});
  assert.deepEqual(r.payload, { fullName: "Asha K" });
});
test("license: expired / soon / ok / unknown", () => {
  const now = new Date(2026, 9, 26);
  assert.equal(licenseState("2026-10-25", now).state, "expired");
  assert.equal(licenseState("2026-10-26", now).state, "soon");
  assert.equal(licenseState("2026-11-25", now).daysLeft, 30);
  assert.equal(licenseState("2026-11-25", now).state, "soon");
  assert.equal(licenseState("2026-11-26", now).state, "ok");
  assert.equal(licenseState(null, now).state, "unknown");
  assert.equal(licenseState("garbage", now).state, "unknown");
});
test("geo: haversine known values and formatting", () => {
  const ranchi = { latitude: 23.3441, longitude: 85.3096 };
  const dhanbad = { latitude: 23.7957, longitude: 86.4304 };
  const km = haversineKm(ranchi, dhanbad);
  assert.ok(km > 115 && km < 130, `got ${km}`);
  assert.equal(haversineKm(ranchi, ranchi), 0);
  assert.equal(formatDistance(0.85), "850 m");
  assert.equal(formatDistance(3.24), "3.2 km");
});
