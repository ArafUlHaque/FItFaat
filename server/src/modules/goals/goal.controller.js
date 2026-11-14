import { ApiError } from "../../utils/ApiError.js";
import { FitnessGoal } from "./goal.model.js";
import { MeasurementLog } from "../measurements/measurement.model.js";

// Helper to safely get numeric or null
function parseOptionalNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

// POST /api/goals
export async function setOrUpdateGoal(req, res) {
  const rawTargetWeight = req.body.targetWeight !== undefined ? req.body.targetWeight : req.body.targetWeightKg;
  if (
    rawTargetWeight === undefined ||
    rawTargetWeight === null ||
    rawTargetWeight === "" ||
    isNaN(Number(rawTargetWeight)) ||
    Number(rawTargetWeight) <= 0
  ) {
    throw new ApiError(400, "Validation failed", {
      targetWeight: "Target weight is required and must be a positive number",
    });
  }

  const targetWeight = Number(rawTargetWeight);

  let rawStartWeight = req.body.startWeight !== undefined ? req.body.startWeight : req.body.startWeightKg;
  let startWeight;

  if (rawStartWeight === undefined || rawStartWeight === null || rawStartWeight === "") {
    // Automatically use their latest logged weight
    const latestLog = await MeasurementLog.findOne({ userId: req.user._id }).sort({ date: -1, createdAt: -1 });
    if (latestLog && typeof latestLog.weight === "number") {
      startWeight = latestLog.weight;
    } else {
      throw new ApiError(400, "Validation failed", {
        startWeight: "startWeight is required when no previous measurement log exists",
      });
    }
  } else {
    if (isNaN(Number(rawStartWeight)) || Number(rawStartWeight) <= 0) {
      throw new ApiError(400, "Validation failed", {
        startWeight: "Starting weight must be a positive number",
      });
    }
    startWeight = Number(rawStartWeight);
  }

  const rawTargetDate = req.body.targetDate !== undefined ? req.body.targetDate : req.body.deadlineDate;
  let targetDate = null;
  if (rawTargetDate) {
    const parsedDate = new Date(rawTargetDate);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Validation failed", {
        targetDate: "Invalid targetDate format",
      });
    }
    targetDate = parsedDate;
  }

  let startDate = new Date();
  if (req.body.startDate) {
    const parsedStart = new Date(req.body.startDate);
    if (isNaN(parsedStart.getTime())) {
      throw new ApiError(400, "Validation failed", {
        startDate: "Invalid startDate format",
      });
    }
    startDate = parsedStart;
  }

  const targetBodyFat = parseOptionalNumber(req.body.targetBodyFat);
  const goalType = req.body.goalType ? String(req.body.goalType).trim() : "weight_loss";
  const status = req.body.status || "active";

  // Check if user already has an active goal
  let goal = await FitnessGoal.findOne({ userId: req.user._id, status: "active" });

  if (goal) {
    goal.targetWeight = targetWeight;
    goal.startWeight = startWeight;
    if (targetDate) goal.targetDate = targetDate;
    if (req.body.startDate) goal.startDate = startDate;
    if (targetBodyFat !== null) goal.targetBodyFat = targetBodyFat;
    if (req.body.goalType) goal.goalType = goalType;
    if (req.body.status) goal.status = status;
    await goal.save();

    return res.json({
      success: true,
      data: { goal },
    });
  }

  goal = await FitnessGoal.create({
    userId: req.user._id,
    targetWeight,
    startWeight,
    startDate,
    targetDate,
    targetBodyFat,
    goalType,
    status,
  });

  return res.status(201).json({
    success: true,
    data: { goal },
  });
}

// router.get("/", getActiveGoal);
// GET /api/goals
export async function getActiveGoal(req, res) {
  const goal = await FitnessGoal.findOne({ userId: req.user._id, status: "active" }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { goal: goal || null },
  });
}

