import { HABIT_TYPES, todayLocalISO, WEEKDAYS } from "./habit.rules.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isText = (s, min, max) =>
  typeof s === "string" && s.trim().length >= min && s.trim().length <= max;
const isPositiveNumber = (n, max = 100000) =>
  typeof n === "number" && Number.isFinite(n) && n > 0 && n <= max;
const isNonNegativeNumber = (n, max = 100000) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;

export function validateHabit(body = {}) {
  const errors = {};

  if (!isText(body.name, 1, 60)) {
    errors.name = "Habit name is required (1 to 60 characters)";
  }

  const goalType = body.goalType ?? "completion";
  if (!HABIT_TYPES.includes(goalType)) {
    errors.goalType = `goalType must be one of: ${HABIT_TYPES.join(", ")}`;
  }

  let targetValue = 1;
  let unit = "session";

  if (goalType === "completion") {
    targetValue = isPositiveNumber(body.targetValue, 100) ? body.targetValue : 1;
    unit = isText(body.unit, 1, 20) ? body.unit.trim() : "session";
  } else if (goalType === "measurable") {
    if (!isPositiveNumber(body.targetValue, 100000)) {
      errors.targetValue = "Daily goal must be a number greater than zero";
    } else {
      targetValue = body.targetValue;
    }
    if (!isText(body.unit, 1, 20)) {
      errors.unit = "Unit is required (e.g. ml, portions, mins)";
    } else {
      unit = body.unit.trim();
    }
  }

  let repeatDays = [...WEEKDAYS];
  if (body.repeatDays !== undefined) {
    if (
      !Array.isArray(body.repeatDays) ||
      body.repeatDays.length < 1 ||
      body.repeatDays.some((d) => !WEEKDAYS.includes(d))
    ) {
      errors.repeatDays = `repeatDays must be a non-empty list using: ${WEEKDAYS.join(", ")}`;
    } else {
      repeatDays = [...new Set(body.repeatDays)].sort(
        (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b),
      );
    }
  }

  let reminderTime = null;
  if (body.reminderTime !== undefined && body.reminderTime !== null && body.reminderTime !== "") {
    if (typeof body.reminderTime !== "string" || !TIME_PATTERN.test(body.reminderTime.trim())) {
      errors.reminderTime = "Reminder time must be in HH:MM format, e.g. 09:00";
    } else {
      reminderTime = body.reminderTime.trim();
    }
  }

  const reminderEnabled =
    body.reminderEnabled !== undefined ? Boolean(body.reminderEnabled) : Boolean(reminderTime);

  return {
    errors,
    value: {
      name: body.name?.trim?.(),
      goalType,
      targetValue,
      unit,
      repeatDays,
      reminderEnabled,
      reminderTime,
    },
  };
}

// Accepts either `value` (set exact amount) or `delta` (increment, e.g. +250 ml).
export function validateHabitProgress(body = {}) {
  const errors = {};

  const date = body.date === undefined ? todayLocalISO() : body.date;
  if (typeof date !== "string" || !DATE_PATTERN.test(date.trim())) {
    errors.date = "date must be in YYYY-MM-DD format";
  }

  const hasValue = body.value !== undefined;
  const hasDelta = body.delta !== undefined;

  if (!hasValue && !hasDelta) {
    errors.value = "Provide either value (total for the day) or delta (amount to add)";
  } else if (hasValue && !isNonNegativeNumber(body.value, 100000)) {
    errors.value = "value must be a number of 0 or more";
  } else if (hasDelta && !isPositiveNumber(body.delta, 100000)) {
    errors.delta = "delta must be a number greater than 0";
  }

  return {
    errors,
    value: {
      date: typeof date === "string" ? date.trim() : todayLocalISO(),
      value: hasValue ? body.value : undefined,
      delta: hasDelta ? body.delta : undefined,
    },
  };
}

export function validateHistoryQuery(query = {}) {
  const errors = {};
  const endDate = query.date === undefined ? todayLocalISO() : query.date;
  let days = 28;

  if (typeof endDate !== "string" || !DATE_PATTERN.test(endDate.trim())) {
    errors.date = "date must be in YYYY-MM-DD format";
  }

  if (query.days !== undefined) {
    const parsed = Number(query.days);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      errors.days = "days must be a whole number between 1 and 90";
    } else {
      days = parsed;
    }
  }

  return {
    errors,
    value: {
      date: typeof endDate === "string" ? endDate.trim() : todayLocalISO(),
      days,
    },
  };
}