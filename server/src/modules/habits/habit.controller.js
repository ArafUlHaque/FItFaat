import { ApiError } from "../../utils/ApiError.js";
import { Habit } from "./habit.model.js";
import {
  buildHabitHistory,
  getDueReminders,
  todayLocalISO,
  toHabitSummary,
} from "./habit.rules.js";
import {
  validateHabit,
  validateHabitProgress,
  validateHistoryQuery,
} from "./habit.validation.js";

function failIfInvalid(errors) {
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);
}

// Every query includes user: req.userId, so one user can never read,
// change, or delete another user's habit.
async function findOwnHabit(req) {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
  if (!habit) throw new ApiError(404, "Habit not found");
  return habit;
}

// GET /api/v1/habits?date=YYYY-MM-DD
export async function listHabits(req, res) {
  const { errors, value } = validateHistoryQuery(req.query);
  failIfInvalid(errors);

  const habits = await Habit.find({ user: req.userId }).sort({ createdAt: 1 });
  const summaries = habits.map((h) => toHabitSummary(h, value.date));
  const completedCount = summaries.filter((s) => s.today.status === "complete").length;

  res.json({
    success: true,
    data: {
      date: value.date,
      completedCount,
      totalCount: summaries.length,
      habits: summaries,
      reminders: getDueReminders(habits, value.date),
    },
  });
}

// GET /api/v1/habits/reminders?date=YYYY-MM-DD&time=HH:MM
export async function listReminders(req, res) {
  const { errors, value } = validateHistoryQuery(req.query);
  failIfInvalid(errors);

  const currentTime = typeof req.query.time === "string" ? req.query.time.trim() : null;
  const habits = await Habit.find({ user: req.userId, reminderEnabled: true }).sort({
    createdAt: 1,
  });

  res.json({
    success: true,
    data: {
      date: value.date,
      reminders: getDueReminders(habits, value.date, currentTime),
    },
  });
}

// POST /api/v1/habits
export async function createHabit(req, res) {
  const { errors, value } = validateHabit(req.body);
  failIfInvalid(errors);

  const habit = await Habit.create({ user: req.userId, ...value });
  res.status(201).json({
    success: true,
    data: {
      habit: toHabitSummary(habit),
      history: buildHabitHistory(habit),
    },
  });
}

// GET /api/v1/habits/:id?date=YYYY-MM-DD&days=28
export async function getHabit(req, res) {
  const { errors, value } = validateHistoryQuery(req.query);
  failIfInvalid(errors);

  const habit = await findOwnHabit(req);
  res.json({
    success: true,
    data: {
      habit: toHabitSummary(habit, value.date),
      history: buildHabitHistory(habit, value.date, value.days),
    },
  });
}

// PATCH /api/v1/habits/:id
export async function updateHabit(req, res) {
  const { errors, value } = validateHabit(req.body);
  failIfInvalid(errors);

  const habit = await findOwnHabit(req);
  Object.assign(habit, value);
  await habit.save();

  res.json({
    success: true,
    data: {
      habit: toHabitSummary(habit),
      history: buildHabitHistory(habit),
    },
  });
}

// DELETE /api/v1/habits/:id
export async function deleteHabit(req, res) {
  const habit = await findOwnHabit(req);
  await habit.deleteOne();
  res.json({ success: true, data: { id: habit.id, deleted: true } });
}

// POST /api/v1/habits/:id/progress
// body: { date?: "YYYY-MM-DD", value?: Number, delta?: Number }
// Supports either setting an exact total (`value: 1`) or adding an increment (`delta: 250`).
export async function recordHabitProgress(req, res) {
  const { errors, value } = validateHabitProgress(req.body);
  failIfInvalid(errors);

  const habit = await findOwnHabit(req);
  const existing = habit.logs.find((l) => l.date === value.date);
  const currentVal = existing ? existing.value : 0;
  const nextVal = value.delta !== undefined ? currentVal + value.delta : value.value;

  if (nextVal <= 0) {
    habit.logs = habit.logs.filter((l) => l.date !== value.date);
  } else if (existing) {
    existing.value = nextVal;
  } else {
    habit.logs.push({ date: value.date, value: nextVal });
  }

  await habit.save();
  res.json({
    success: true,
    data: {
      habit: toHabitSummary(habit, value.date),
      history: buildHabitHistory(habit, value.date),
    },
  });
}

// POST /api/v1/habits/:id/dismiss-reminder   body: { date?: "YYYY-MM-DD" }
export async function dismissReminder(req, res) {
  const date = typeof req.body?.date === "string" ? req.body.date.trim() : todayLocalISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Validation failed", { date: "date must be in YYYY-MM-DD format" });
  }

  const habit = await findOwnHabit(req);
  habit.dismissedReminderDate = date;
  await habit.save();

  res.json({ success: true, data: { habit: toHabitSummary(habit, date) } });
}