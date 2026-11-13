import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createHabit,
  deleteHabit,
  dismissReminder,
  getHabit,
  listHabits,
  listReminders,
  recordHabitProgress,
  updateHabit,
} from "./habit.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", listHabits);
router.get("/reminders", listReminders); // before "/:id" so "reminders" isn't parsed as an id
router.post("/", createHabit);
router.get("/:id", getHabit);
router.patch("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.post("/:id/progress", recordHabitProgress);
router.post("/:id/dismiss-reminder", dismissReminder);

export default router;