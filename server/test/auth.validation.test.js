import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLogin, validateRegister } from "../src/modules/auth/auth.validation.js";

const valid = { name: "Araf", email: "araf@example.com", password: "longenough" };

test("register accepts valid details", () => {
  assert.deepEqual(validateRegister(valid), {});
});

test("register rejects a missing name", () => {
  assert.ok(validateRegister({ ...valid, name: "   " }).name);
});

test("register rejects an invalid email", () => {
  assert.ok(validateRegister({ ...valid, email: "not-an-email" }).email);
});

test("register rejects a short password", () => {
  assert.ok(validateRegister({ ...valid, password: "short" }).password);
});

test("register rejects non-string fields", () => {
  const errors = validateRegister({ name: 1, email: {}, password: [] });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "name", "password"]);
});

test("login requires email and password", () => {
  assert.deepEqual(Object.keys(validateLogin({})).sort(), ["email", "password"]);
});
