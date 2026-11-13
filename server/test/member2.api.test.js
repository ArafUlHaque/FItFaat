import { before, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

let app;

before(async () => {
  process.env.NODE_ENV = "test";
  ({ default: app } = await import("../src/app.js"));
});

for (const [method, path] of [
  ["get", "/api/v1/recipes"],
  ["post", "/api/v1/recipes"],
  ["get", "/api/v1/recipes/665f1c2b9a1e4b0012345678"],
  ["put", "/api/v1/recipes/665f1c2b9a1e4b0012345678"],
  ["delete", "/api/v1/recipes/665f1c2b9a1e4b0012345678"],
  ["post", "/api/v1/recipes/665f1c2b9a1e4b0012345678/log"],
  ["get", "/api/v1/habits"],
  ["get", "/api/v1/habits/reminders"],
  ["post", "/api/v1/habits"],
  ["get", "/api/v1/habits/665f1c2b9a1e4b0012345678"],
  ["patch", "/api/v1/habits/665f1c2b9a1e4b0012345678"],
  ["delete", "/api/v1/habits/665f1c2b9a1e4b0012345678"],
  ["post", "/api/v1/habits/665f1c2b9a1e4b0012345678/progress"],
  ["post", "/api/v1/habits/665f1c2b9a1e4b0012345678/dismiss-reminder"],
]) {
  test(`${method.toUpperCase()} ${path} without a token returns 401`, async () => {
    const res = await request(app)[method](path);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
}