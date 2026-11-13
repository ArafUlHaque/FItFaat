import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildHabitHistory,
  getDayStatus,
  getDueReminders,
} from "../src/modules/habits/habit.rules.js";
import { validateHabit, validateHabitProgress } from "../src/modules/habits/habit.validation.js";

test("getDayStatus maps progress to to_do, in_progress, and complete", () => {
  assert.equal(getDayStatus(0, 2500), "to_do");
  assert.equal(getDayStatus(1500, 2500), "in_progress");
  assert.equal(getDayStatus(2500, 2500), "complete");
  assert.equal(getDayStatus(3000, 2500), "complete");
});

test("buildHabitHistory computes met, partly, missed cells and averagePerDay", () => {
  const habit = {
    targetValue: 2000,
    unit: "ml",
    logs: [
      { date: "2026-11-13", value: 2000 },
      { date: "2026-11-12", value: 1500 },
    ],
  };
  const history = buildHabitHistory(habit, "2026-11-13", 7);
  assert.equal(history.daysMet, 1);
  assert.equal(history.daysPartly, 1);
  assert.equal(history.averagePerDay, 500);
  assert.equal(history.cells.at(-1).state, "met");
  assert.equal(history.cells.at(-2).state, "partly");
  assert.equal(history.cells[0].state, "missed");
});

test("getDueReminders formats label like Figma and excludes dismissed habits", () => {
  const habits = [
    {
      id: "h1",
      name: "Mobility session",
      goalType: "completion",
      targetValue: 1,
      unit: "session",
      reminderEnabled: true,
      reminderTime: "18:00",
      dismissedReminderDate: null,
      logs: [],
    },
    {
      id: "h2",
      name: "Drink water",
      goalType: "measurable",
      targetValue: 2500,
      unit: "ml",
      reminderEnabled: true,
      reminderTime: "09:00",
      dismissedReminderDate: "2026-11-13",
      logs: [],
    },
  ];
  const reminders = getDueReminders(habits, "2026-11-13");
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].habitId, "h1");
  assert.equal(reminders[0].label, "Reminder · Mobility session at 18:00");
});

test("validateHabit and validateHabitProgress enforce required fields and support delta", () => {
  assert.deepEqual(validateHabit({ name: "Mobility", goalType: "completion" }).errors, {});
  const { errors } = validateHabit({ name: "Water", goalType: "measurable", targetValue: 0, unit: "" });
  assert.ok(errors.targetValue);
  assert.ok(errors.unit);

  assert.deepEqual(validateHabitProgress({ delta: 250 }).errors, {});
  assert.ok(validateHabitProgress({ date: "bad", value: -5 }).errors.date);
  assert.ok(validateHabitProgress({ date: "2026-11-13", value: -5 }).errors.value);
});