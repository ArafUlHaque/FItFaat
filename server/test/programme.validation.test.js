import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateAnswers,
  validateProgramme,
  validateRename,
} from "../src/modules/programmes/programme.validation.js";

const validAnswers = {
  goal: "build_muscle",
  experience: "beginner",
  equipment: ["dumbbells", "bench"],
  daysPerWeek: 3,
  sessionMinutes: 45,
};

const exercise = { pattern: "squat", exerciseId: 203, name: "Dumbbell Goblet Squat", sets: 3, reps: "10", restSeconds: 90 };

const validProgramme = () => ({
  templateKey: "full-body-foundations",
  name: "My plan",
  answers: { ...validAnswers },
  schedule: [
    { weekday: "fri", title: "Day C", exercises: [{ ...exercise }] },
    { weekday: "mon", title: "Day A", exercises: [{ ...exercise }] },
  ],
});

test("valid quiz answers pass and duplicate equipment is removed", () => {
  const { errors, value } = validateAnswers({ ...validAnswers, equipment: ["bench", "bench"] });
  assert.deepEqual(errors, {});
  assert.deepEqual(value.equipment, ["bench"]);
});

test("equipment can be left out for bodyweight only", () => {
  const { errors, value } = validateAnswers({ ...validAnswers, equipment: undefined });
  assert.deepEqual(errors, {});
  assert.deepEqual(value.equipment, []);
});

test("invalid quiz answers give an error for each field", () => {
  const { errors } = validateAnswers({
    goal: "fly",
    experience: "expert",
    equipment: ["spaceship"],
    daysPerWeek: 8,
    sessionMinutes: "45", // a string, not a number
  });
  assert.deepEqual(
    Object.keys(errors).sort(),
    ["daysPerWeek", "equipment", "experience", "goal", "sessionMinutes"],
  );
});

test("inherited object keys are not accepted as answers", () => {
  assert.ok(validateAnswers({ ...validAnswers, goal: "toString" }).errors.goal);
});

test("a valid programme passes and its days are sorted Monday first", () => {
  const { errors, value } = validateProgramme(validProgramme());
  assert.deepEqual(errors, {});
  assert.deepEqual(value.schedule.map((d) => d.weekday), ["mon", "fri"]);
});

test("a programme cannot use the same weekday twice", () => {
  const body = validProgramme();
  body.schedule[1].weekday = "fri";
  assert.ok(validateProgramme(body).errors["schedule[1].weekday"]);
});

test("a programme cannot have more days than answers.daysPerWeek", () => {
  const body = validProgramme();
  body.answers.daysPerWeek = 1;
  assert.match(validateProgramme(body).errors.schedule, /2 days/);
});

test("bad exercises are reported with their position", () => {
  const body = validProgramme();
  body.schedule[0].exercises[0] = { ...exercise, sets: 0, reps: "", exerciseId: "abc" };
  const { errors } = validateProgramme(body);
  assert.ok(errors["schedule[0].exercises[0].sets"]);
  assert.ok(errors["schedule[0].exercises[0].reps"]);
  assert.ok(errors["schedule[0].exercises[0].exerciseId"]);
});

test("missing templateKey, answers and schedule are all reported", () => {
  const { errors } = validateProgramme({});
  assert.ok(errors.templateKey);
  assert.ok(errors["answers.goal"]);
  assert.ok(errors.schedule);
});

test("rename needs a name of 1 to 60 characters", () => {
  assert.deepEqual(validateRename({ name: " New name " }).errors, {});
  assert.equal(validateRename({ name: " New name " }).value.name, "New name");
  assert.ok(validateRename({ name: "" }).errors.name);
  assert.ok(validateRename({ name: "x".repeat(61) }).errors.name);
  assert.ok(validateRename({}).errors.name);
});
