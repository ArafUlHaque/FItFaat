import {
  EQUIPMENT,
  GOALS,
  LEVELS,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
  WEEKDAYS,
} from "./programme.constants.js";

// Each function returns { errors, value }. An empty errors object means valid;
// value holds the cleaned data the controller should save or use.

const isWholeNumber = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
const isText = (s, min, max) => typeof s === "string" && s.trim().length >= min && s.trim().length <= max;
const keysOf = (object) => Object.keys(object).join(", ");

// Quiz answers: POST /programmes/generate, and "answers" inside POST /programmes.
export function validateAnswers(body = {}) {
  const errors = {};
  const value = {};

  if (!Object.hasOwn(GOALS, body.goal)) errors.goal = `goal must be one of: ${keysOf(GOALS)}`;
  else value.goal = body.goal;

  if (!Object.hasOwn(LEVELS, body.experience)) {
    errors.experience = `experience must be one of: ${keysOf(LEVELS)}`;
  } else value.experience = body.experience;

  if (!isWholeNumber(body.daysPerWeek, 1, 7)) errors.daysPerWeek = "daysPerWeek must be a whole number from 1 to 7";
  else value.daysPerWeek = body.daysPerWeek;

  if (!isWholeNumber(body.sessionMinutes, MIN_SESSION_MINUTES, MAX_SESSION_MINUTES)) {
    errors.sessionMinutes = `sessionMinutes must be a whole number from ${MIN_SESSION_MINUTES} to ${MAX_SESSION_MINUTES}`;
  } else value.sessionMinutes = body.sessionMinutes;

  const equipment = body.equipment ?? [];
  if (!Array.isArray(equipment) || equipment.some((item) => !Object.hasOwn(EQUIPMENT, item))) {
    errors.equipment = `equipment must be a list using: ${keysOf(EQUIPMENT)} (leave it empty for bodyweight only)`;
  } else value.equipment = [...new Set(equipment)];

  return { errors, value };
}

function validateExercise(exercise, path, errors) {
  if (!exercise || typeof exercise !== "object") {
    errors[path] = "Each exercise must be an object";
    return null;
  }
  const { exerciseId, name, sets, reps, restSeconds, pattern } = exercise;
  if (!isWholeNumber(exerciseId, 1, Number.MAX_SAFE_INTEGER)) errors[`${path}.exerciseId`] = "exerciseId must be a wger exercise id";
  if (!isText(name, 1, 100)) errors[`${path}.name`] = "name is required (up to 100 characters)";
  if (!isWholeNumber(sets, 1, 10)) errors[`${path}.sets`] = "sets must be a whole number from 1 to 10";
  if (!isText(reps, 1, 20)) errors[`${path}.reps`] = 'reps is required, e.g. "8-10" or "30s"';
  if (!isWholeNumber(restSeconds, 0, 600)) errors[`${path}.restSeconds`] = "restSeconds must be from 0 to 600";
  if (pattern !== undefined && !isText(pattern, 1, 30)) errors[`${path}.pattern`] = "pattern must be short text";

  return {
    pattern: pattern?.trim(),
    exerciseId,
    name: name?.trim(),
    sets,
    reps: reps?.trim(),
    restSeconds,
  };
}

// Body of POST /api/v1/programmes (the user may have edited the proposal).
export function validateProgramme(body = {}) {
  const errors = {};

  if (!isText(body.templateKey, 1, 60)) errors.templateKey = "templateKey is required";
  if (body.name !== undefined && !isText(body.name, 1, 60)) errors.name = "name must be 1 to 60 characters";

  const answers = validateAnswers(body.answers || {});
  for (const [field, message] of Object.entries(answers.errors)) errors[`answers.${field}`] = message;

  const schedule = [];
  if (!Array.isArray(body.schedule) || body.schedule.length < 1 || body.schedule.length > 7) {
    errors.schedule = "schedule must be a list of 1 to 7 training days";
  } else {
    if (answers.value.daysPerWeek && body.schedule.length > answers.value.daysPerWeek) {
      errors.schedule = `schedule has ${body.schedule.length} days but answers.daysPerWeek is ${answers.value.daysPerWeek}`;
    }
    const seen = new Set();
    body.schedule.forEach((day, i) => {
      const path = `schedule[${i}]`;
      if (!day || typeof day !== "object") {
        errors[path] = "Each day must be an object";
        return;
      }
      if (!WEEKDAYS.includes(day.weekday)) errors[`${path}.weekday`] = `weekday must be one of: ${WEEKDAYS.join(", ")}`;
      else if (seen.has(day.weekday)) errors[`${path}.weekday`] = `${day.weekday} is used more than once`;
      seen.add(day.weekday);

      if (!isText(day.title, 1, 40)) errors[`${path}.title`] = "title is required (up to 40 characters)";

      if (!Array.isArray(day.exercises) || day.exercises.length < 1 || day.exercises.length > 12) {
        errors[`${path}.exercises`] = "exercises must be a list of 1 to 12 exercises";
        return;
      }
      schedule.push({
        weekday: day.weekday,
        title: day.title?.trim(),
        exercises: day.exercises.map((ex, j) => validateExercise(ex, `${path}.exercises[${j}]`, errors)),
      });
    });
    // Keep the days in calendar order, Monday first.
    schedule.sort((a, b) => WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday));
  }

  return {
    errors,
    value: {
      templateKey: body.templateKey?.trim?.(),
      name: body.name?.trim?.(),
      answers: answers.value,
      schedule,
    },
  };
}

// Body of PATCH /api/v1/programmes/:id
export function validateRename(body = {}) {
  const errors = {};
  if (!isText(body.name, 1, 60)) errors.name = "name is required (1 to 60 characters)";
  return { errors, value: { name: body.name?.trim?.() } };
}
