// These requests never reach MongoDB, so they run without a database.
import { before, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

let app;
before(async () => {
  process.env.NODE_ENV = "test";
  ({ default: app } = await import("../src/app.js"));
});

test("GET /api/v1/health responds", async () => {
  const res = await request(app).get("/api/v1/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, "ok");
});

test("unknown routes return 404 in the standard error shape", async () => {
  const res = await request(app).get("/api/v1/nothing-here");
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.ok(res.body.error.message);
});

test("register with invalid details returns 400 with field errors", async () => {
  const res = await request(app).post("/api/v1/auth/register").send({ email: "bad" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.name);
  assert.ok(res.body.error.details.email);
  assert.ok(res.body.error.details.password);
});

test("malformed JSON returns 400", async () => {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .set("Content-Type", "application/json")
    .send("{bad json");
  assert.equal(res.status, 400);
});

test("protected route without a token returns 401", async () => {
  const res = await request(app).get("/api/v1/auth/me");
  assert.equal(res.status, 401);
});

test("protected route with a forged token returns 401", async () => {
  const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer abc.def.ghi");
  assert.equal(res.status, 401);
});
