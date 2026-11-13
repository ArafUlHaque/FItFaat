/*
 * Habit tracking rules (requirement 4.10 & DESIGN.md)
 * ----------------------------------------------------
 * All functions here are pure (no database, no network) so they are easy to test.
 */

export const HABIT_TYPES = ["completion", "measurable"];
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function todayLocalISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayStatus(value, targetValue) {
  if (!value || value <= 0) return "to_do";
  if (value >= targetValue) return "complete";
  return "in_progress";
}

export function getHistoryCellState(value, targetValue) {
  if (!value || value <= 0) return "missed";
  if (value >= targetValue) return "met";
  return "partly";
}

export function buildDateRange(endDateStr, days = 28) {
  const [y, m, d] = endDateStr.split("-").map(Number);
  const endUTC = Date.UTC(y, m - 1, d);
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(endUTC - i * 86400000);
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}

// Builds the 28-day (4-week) history grid + "Last 4 weeks: X of 28 days" and "Average a day" stat boxes.
export function buildHabitHistory(habit, endDateStr = todayLocalISO(), days = 28) {
  const logByDate = new Map((habit.logs || []).map((l) => [l.date, l.value]));
  const dates = buildDateRange(endDateStr, days);

  const cells = dates.map((date) => {
    const value = logByDate.get(date) || 0;
    return {
      date,
      value,
      targetValue: habit.targetValue,
      state: getHistoryCellState(value, habit.targetValue),
      isToday: date === endDateStr,
    };
  });

  const daysMet = cells.filter((c) => c.state === "met").length;
  const daysPartly = cells.filter((c) => c.state === "partly").length;
  const totalValue = cells.reduce((sum, c) => sum + c.value, 0);
  const averagePerDay = Math.round((totalValue / days) * 10) / 10;

  return {
    days,
    daysMet,
    daysPartly,
    averagePerDay,
    unit: habit.unit,
    completionRate: Math.round((daysMet / days) * 100),
    cells,
  };
}

export function toHabitSummary(habitDoc, dateStr = todayLocalISO()) {
  const habit = typeof habitDoc.toJSON === "function" ? habitDoc.toJSON() : { ...habitDoc };
  const todayEntry = (habit.logs || []).find((l) => l.date === dateStr);
  const todayValue = todayEntry ? todayEntry.value : 0;
  const status = getDayStatus(todayValue, habit.targetValue);
  const progressPercent = Math.min(100, Math.round((todayValue / habit.targetValue) * 100));

  const reminderDue = Boolean(
    habit.reminderEnabled &&
      status !== "complete" &&
      habit.dismissedReminderDate !== dateStr,
  );

  return {
    id: habit.id,
    name: habit.name,
    goalType: habit.goalType,
    targetValue: habit.targetValue,
    unit: habit.unit,
    repeatDays: habit.repeatDays || WEEKDAYS,
    reminderEnabled: Boolean(habit.reminderEnabled),
    reminderTime: habit.reminderTime || null,
    today: {
      date: dateStr,
      value: todayValue,
      status,
      progressPercent,
      reminderDue,
    },
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

export function getDueReminders(habits, dateStr = todayLocalISO(), currentTime = null) {
  return habits
    .map((h) => toHabitSummary(h, dateStr))
    .filter((summary) => {
      if (!summary.today.reminderDue) return false;
      if (currentTime && summary.reminderTime) {
        return summary.reminderTime <= currentTime;
      }
      return true;
    })
    .map((summary) => ({
      habitId: summary.id,
      name: summary.name,
      reminderTime: summary.reminderTime,
      // Matches the purple banner in Figma: "Reminder · Mobility session at 18:00"
      label: summary.reminderTime
        ? `Reminder · ${summary.name} at ${summary.reminderTime}`
        : `Reminder · ${summary.name}`,
    }));
}