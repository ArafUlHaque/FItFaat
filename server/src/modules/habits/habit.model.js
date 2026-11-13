import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";
import { HABIT_TYPES, WEEKDAYS } from "./habit.rules.js";

const habitLogSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    goalType: { type: String, enum: HABIT_TYPES, default: "completion" },
    targetValue: { type: Number, required: true, min: 0.01, default: 1 },
    unit: { type: String, required: true, trim: true, maxlength: 20, default: "session" },
    repeatDays: { type: [String], enum: WEEKDAYS, default: () => [...WEEKDAYS] },
    reminderEnabled: { type: Boolean, default: false },
    reminderTime: { type: String, default: null },
    dismissedReminderDate: { type: String, default: null },
    logs: { type: [habitLogSchema], default: [] },
  },
  { timestamps: true, toJSON: cleanJSON },
);

habitSchema.index({ user: 1, createdAt: 1 });

export const Habit = mongoose.model("Habit", habitSchema);