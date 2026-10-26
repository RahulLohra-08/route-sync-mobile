import test from "node:test";
import assert from "node:assert/strict";
import { buildBusEntries, matchesBus } from "../src/features/buses/busStatus.ts";
import { visibleStopIndexes } from "../src/features/routes/stopsView.ts";

const bus = (id: string, status = "ACTIVE", busNumber = id) => ({ id, busNumber, registrationNumber: `REG-${id}`, status }) as never;
const trip = (id: string, busId: string, status: string, routeId = "r1") => ({ id, busId, status, routeId }) as never;
const route = { id: "r1", routeCode: "R-12", routeName: "Ranchi Express", startLocation: "Ranchi", endLocation: "Dhanbad" } as never;
const routes = new Map([["r1", route]]) as never;

test("bus state: live trip wins over scheduled; trip link comes from trips only", () => {
  const [e] = buildBusEntries([bus("b1")], [trip("t1", "b1", "SCHEDULED"), trip("t2", "b1", "IN_PROGRESS")], routes);
  assert.equal(e.state, "live");
  assert.equal((e.trip as { id: string }).id, "t2");
});

test("bus without trip is idle with no route; finished trips are ignored", () => {
  const [e] = buildBusEntries([bus("b1")], [trip("t1", "b1", "COMPLETED")], routes);
  assert.equal(e.state, "idle");
  assert.equal(e.trip, null);
  assert.equal(e.route, null);
});

test("maintenance/inactive buses are never shown as live even with a trip", () => {
  const out = buildBusEntries([bus("b1", "MAINTENANCE"), bus("b2", "INACTIVE")], [trip("t1", "b1", "IN_PROGRESS"), trip("t2", "b2", "IN_PROGRESS")], routes);
  assert.deepEqual(out.map((e) => e.state).sort(), ["inactive", "maintenance"]);
});

test("ordering: live, boarding, scheduled, idle, maintenance", () => {
  const out = buildBusEntries(
    [bus("a", "MAINTENANCE"), bus("b"), bus("c"), bus("d"), bus("e")],
    [trip("t1", "c", "BOARDING"), trip("t2", "d", "IN_PROGRESS"), trip("t3", "e", "SCHEDULED")],
    routes,
  );
  assert.deepEqual(out.map((e) => e.state), ["live", "boarding", "scheduled", "idle", "maintenance"]);
});

test("search matches bus number, registration and route text; blank matches all", () => {
  const [e] = buildBusEntries([bus("b1", "ACTIVE", "JH-01")], [trip("t1", "b1", "IN_PROGRESS")], routes);
  assert.equal(matchesBus(e, ""), true);
  assert.equal(matchesBus(e, "jh-01"), true);
  assert.equal(matchesBus(e, "reg-b1"), true);
  assert.equal(matchesBus(e, "dhanbad"), true);
  assert.equal(matchesBus(e, "r-12"), true);
  assert.equal(matchesBus(e, "kolkata"), false);
});

const ids = Array.from({ length: 10 }, (_, i) => `s${i}`);
test("collapsed route keeps first 2 + last 2", () => {
  assert.deepEqual(visibleStopIndexes(ids, null, false), [0, 1, 8, 9]);
});
test("a selected middle stop is never hidden when collapsed", () => {
  assert.deepEqual(visibleStopIndexes(ids, "s5", false), [0, 1, 5, 8, 9]);
});
test("expanded, short routes and collapsible=false show everything", () => {
  assert.equal(visibleStopIndexes(ids, null, true).length, 10);
  assert.equal(visibleStopIndexes(ids.slice(0, 5), null, false).length, 5);
  assert.equal(visibleStopIndexes(ids, null, false, false).length, 10);
});
