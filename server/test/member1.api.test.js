// HTTP tests for the Member 1 routes. They never reach MongoDB, and wger is
// replaced by a fake `fetch`, so they run offline.
import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

let app;
const realFetch = globalThis.fetch;
let fakeWger; // (url) => Response, set by each test

before(async () => {
  process.env.NODE_ENV = "test";
  ({ default: app } = await import("../src/app.js"));
  globalThis.fetch = async (url) => fakeWger(new URL(url));
});

after(() => {
  globalThis.fetch = realFetch;
});

beforeEach(() => {
  fakeWger = () => {
    throw new Error("wger should not be called in this test");
  };
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const squat = {
  id: 615,
  category: { name: "Legs" },
  muscles: [{ name: "Quadriceps femoris", name_en: "Quads" }],
  equipment: [{ name: "Barbell" }],
  images: [],
  videos: [],
  translations: [{ language: 2, name: "Squats", description: "<p>Squat down.</p>" }],
};

test("GET /exercises passes filters to wger and returns summaries", async () => {
  let calledWith;
  fakeWger = (url) => {
    calledWith = url;
    return json({ count: 41, results: [squat] });
  };

  const res = await request(app).get("/api/v1/exercises?search=squat&muscle=10&page=3&limit=20");
  assert.equal(res.status, 200);
  assert.equal(calledWith.pathname, "/api/v2/exerciseinfo/");
  assert.equal(calledWith.searchParams.get("name__search"), "squat");
  assert.equal(calledWith.searchParams.get("muscles"), "10");
  assert.equal(calledWith.searchParams.get("offset"), "40");
  assert.deepEqual(res.body.data.exercises[0].muscles, ["Quads"]);
  assert.equal(res.body.data.totalPages, 3);
});

test("GET /exercises with an invalid filter returns 400 without calling wger", async () => {
  const res = await request(app).get("/api/v1/exercises?muscle=chest");
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.muscle);
});

test("when wger is down, the API returns 503 with a helpful message", async () => {
  fakeWger = () => {
    throw new TypeError("fetch failed");
  };
  const res = await request(app).get("/api/v1/exercises");
  assert.equal(res.status, 503);
  assert.match(res.body.error.message, /unavailable/);
});

test("when wger returns a server error, the API returns 503", async () => {
  fakeWger = () => json({ detail: "boom" }, 500);
  const res = await request(app).get("/api/v1/exercises/filters");
  assert.equal(res.status, 503);
});

test("GET /exercises/:id returns the detail", async () => {
  fakeWger = (url) => {
    assert.equal(url.pathname, "/api/v2/exerciseinfo/615/");
    return json(squat);
  };
  const res = await request(app).get("/api/v1/exercises/615");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data.exercise.instructions, ["Squat down."]);
});

test("GET /exercises/:id for an unknown exercise returns 404", async () => {
  fakeWger = () => json({ detail: "Not found." }, 404);
  const res = await request(app).get("/api/v1/exercises/999999");
  assert.equal(res.status, 404);
});

test("GET /exercises/:id with a non-number id returns 400", async () => {
  const res = await request(app).get("/api/v1/exercises/abc");
  assert.equal(res.status, 400);
});

for (const [method, path] of [
  ["get", "/api/v1/favourites"],
  ["post", "/api/v1/favourites"],
  ["delete", "/api/v1/favourites/615"],
  ["get", "/api/v1/programmes"],
  ["post", "/api/v1/programmes"],
  ["get", "/api/v1/programmes/665f1c2b9a1e4b0012345678"],
  ["patch", "/api/v1/programmes/665f1c2b9a1e4b0012345678"],
  ["delete", "/api/v1/programmes/665f1c2b9a1e4b0012345678"],
]) {
  test(`${method.toUpperCase()} ${path} without a token returns 401`, async () => {
    const res = await request(app)[method](path);
    assert.equal(res.status, 401);
  });
}

test("POST /programmes/generate with invalid answers returns 400", async () => {
  const res = await request(app).post("/api/v1/programmes/generate").send({ goal: "fly" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.goal);
  assert.ok(res.body.error.details.daysPerWeek);
});
