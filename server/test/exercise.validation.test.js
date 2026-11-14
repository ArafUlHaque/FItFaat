import { test } from "node:test";
import assert from "node:assert/strict";
import { toPositiveInt, validateExerciseQuery } from "../src/modules/exercises/exercise.validation.js";

test("toPositiveInt accepts whole numbers of 1 or more only", () => {
  assert.equal(toPositiveInt("12"), 12);
  assert.equal(toPositiveInt(7), 7);
  for (const bad of ["0", "-3", "1.5", "abc", "", undefined, null, 0, 2.5, {}]) {
    assert.equal(toPositiveInt(bad), null, `expected ${JSON.stringify(bad)} to be rejected`);
  }
});

test("an empty query uses the defaults", () => {
  const { errors, value } = validateExerciseQuery({});
  assert.deepEqual(errors, {});
  assert.deepEqual(value, { search: "", muscle: null, equipment: null, page: 1, limit: 20 });
});

test("a full valid query is converted to numbers and trimmed", () => {
  const { errors, value } = validateExerciseQuery({
    search: "  squat ",
    muscle: "10",
    equipment: "3",
    page: "2",
    limit: "5",
  });
  assert.deepEqual(errors, {});
  assert.deepEqual(value, { search: "squat", muscle: 10, equipment: 3, page: 2, limit: 5 });
});

test("invalid query values give field errors", () => {
  const { errors } = validateExerciseQuery({
    search: "x".repeat(51),
    muscle: "chest",
    equipment: "-1",
    page: "0",
    limit: "500",
  });
  assert.deepEqual(Object.keys(errors).sort(), ["equipment", "limit", "muscle", "page", "search"]);
});

test("search sent twice (an array) is rejected", () => {
  assert.ok(validateExerciseQuery({ search: ["a", "b"] }).errors.search);
});
