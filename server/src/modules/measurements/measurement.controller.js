import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { MeasurementLog } from "./measurement.model.js";
import { FitnessGoal } from "../goals/goal.model.js";

// Helper to safely get numeric or null
function parseOptionalNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

// POST /api/measurements
export async function createMeasurement(req, res) {
  const rawWeight = req.body.weight !== undefined ? req.body.weight : req.body.weightKg;
  if (rawWeight === undefined || rawWeight === null || rawWeight === "" || isNaN(Number(rawWeight)) || Number(rawWeight) <= 0) {
    throw new ApiError(400, "Validation failed", {
      weight: "Body weight is required and must be a positive number",
    });
  }

  let date = new Date();
  if (req.body.date) {
    const parsedDate = new Date(req.body.date);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Validation failed", {
        date: "Invalid date format",
      });
    }
    date = parsedDate;
  }

  const waist = parseOptionalNumber(req.body.waist !== undefined ? req.body.waist : req.body.waistCm);
  const chest = parseOptionalNumber(req.body.chest !== undefined ? req.body.chest : req.body.chestCm);
  const hips = parseOptionalNumber(req.body.hips !== undefined ? req.body.hips : req.body.hipsCm);
  const bodyFat = parseOptionalNumber(req.body.bodyFat);
  const arms = parseOptionalNumber(req.body.arms);
  const bmi = parseOptionalNumber(req.body.bmi);
  const notes = req.body.notes ? String(req.body.notes).trim() : "";

  const measurement = await MeasurementLog.create({
    userId: req.user._id,
    date,
    weight: Number(rawWeight),
    waist,
    chest,
    hips,
    bodyFat,
    arms,
    bmi,
    notes,
  });

  res.status(201).json({
    success: true,
    data: { measurement },
  });
}

// GET /api/measurements
export async function listMeasurements(req, res) {
  const query = { userId: req.user._id };

  if (req.query.startDate || req.query.endDate) {
    query.date = {};

    if (req.query.startDate) {
      const start = new Date(req.query.startDate);
      if (isNaN(start.getTime())) {
        throw new ApiError(400, "Invalid startDate query parameter");
      }
      query.date.$gte = start;
    }

    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      if (isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid endDate query parameter");
      }
      // If YYYY-MM-DD was provided, include the full end day up to 23:59:59.999
      if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate)) {
        end.setUTCHours(23, 59, 59, 999);
      }
      query.date.$lte = end;
    }
  }

  const measurements = await MeasurementLog.find(query).sort({ date: 1, createdAt: 1 });

  res.json({
    success: true,
    data: { measurements },
  });
}

// GET /api/measurements/:id
export async function getMeasurementById(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid measurement ID");
  }

  const measurement = await MeasurementLog.findById(id);
  if (!measurement) {
    throw new ApiError(404, "Measurement not found");
  }

  if (measurement.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to view this measurement");
  }

  res.json({
    success: true,
    data: { measurement },
  });
}

// PUT /api/measurements/:id
export async function updateMeasurement(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid measurement ID");
  }

  const measurement = await MeasurementLog.findById(id);
  if (!measurement) {
    throw new ApiError(404, "Measurement not found");
  }

  if (measurement.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to modify this measurement");
  }

  const rawWeight = req.body.weight !== undefined ? req.body.weight : req.body.weightKg;
  if (rawWeight !== undefined) {
    if (isNaN(Number(rawWeight)) || Number(rawWeight) <= 0) {
      throw new ApiError(400, "Validation failed", {
        weight: "Body weight must be a positive number",
      });
    }
    measurement.weight = Number(rawWeight);
  }

  if (req.body.date !== undefined) {
    const d = new Date(req.body.date);
    if (isNaN(d.getTime())) {
      throw new ApiError(400, "Validation failed", {
        date: "Invalid date format",
      });
    }
    measurement.date = d;
  }

  const waist = req.body.waist !== undefined ? req.body.waist : req.body.waistCm;
  if (waist !== undefined) {
    measurement.waist = parseOptionalNumber(waist);
  }

  const chest = req.body.chest !== undefined ? req.body.chest : req.body.chestCm;
  if (chest !== undefined) {
    measurement.chest = parseOptionalNumber(chest);
  }

  const hips = req.body.hips !== undefined ? req.body.hips : req.body.hipsCm;
  if (hips !== undefined) {
    measurement.hips = parseOptionalNumber(hips);
  }

  if (req.body.bodyFat !== undefined) {
    measurement.bodyFat = parseOptionalNumber(req.body.bodyFat);
  }
  if (req.body.arms !== undefined) {
    measurement.arms = parseOptionalNumber(req.body.arms);
  }
  if (req.body.bmi !== undefined) {
    measurement.bmi = parseOptionalNumber(req.body.bmi);
  }
  if (req.body.notes !== undefined) {
    measurement.notes = req.body.notes ? String(req.body.notes).trim() : "";
  }

  await measurement.save();

  res.json({
    success: true,
    data: { measurement },
  });
}

// DELETE /api/measurements/:id
export async function deleteMeasurement(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid measurement ID");
  }

  const measurement = await MeasurementLog.findById(id);
  if (!measurement) {
    throw new ApiError(404, "Measurement not found");
  }

  if (measurement.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to delete this measurement");
  }

  await MeasurementLog.deleteOne({ _id: id });

  res.json({
    success: true,
    data: { id, deleted: true },
  });
}

// GET /api/measurements/progress
export async function getProgress(req, res) {
  // Query measurements sorted by date ascending
  const measurements = await MeasurementLog.find({ userId: req.user._id }).sort({ date: 1, createdAt: 1 });
  const activeGoal = await FitnessGoal.findOne({ userId: req.user._id, status: "active" }).sort({ createdAt: -1 });

  // Chart-ready time-series arrays
  const labels = [];
  const datasets = {
    weight: [],
    waist: [],
    chest: [],
    hips: [],
  };

  const timeline = [];

  for (const m of measurements) {
    const dateStr = m.date instanceof Date
      ? m.date.toISOString().split("T")[0]
      : String(m.date).split("T")[0];

    labels.push(dateStr);
    datasets.weight.push(m.weight !== null && m.weight !== undefined ? m.weight : null);
    datasets.waist.push(m.waist !== null && m.waist !== undefined ? m.waist : null);
    datasets.chest.push(m.chest !== null && m.chest !== undefined ? m.chest : null);
    datasets.hips.push(m.hips !== null && m.hips !== undefined ? m.hips : null);

    timeline.push({
      id: m._id.toString(),
      date: dateStr,
      weight: m.weight,
      weightKg: m.weight,
      waist: m.waist,
      waistCm: m.waist,
      chest: m.chest,
      chestCm: m.chest,
      hips: m.hips,
      hipsCm: m.hips,
      notes: m.notes,
    });
  }

  // Summary statistics calculation
  let startWeight = null;
  let currentWeight = null;
  const targetWeight = activeGoal && typeof activeGoal.targetWeight === "number" ? activeGoal.targetWeight : null;
  let totalChange = 0;
  let remainingToGoal = 0;
  let progressPercentage = 0;

  if (measurements.length > 0) {
    const latest = measurements[measurements.length - 1];
    currentWeight = latest.weight;

    if (activeGoal && typeof activeGoal.startWeight === "number") {
      startWeight = activeGoal.startWeight;
    } else {
      startWeight = measurements[0].weight;
    }

    totalChange = Math.round((currentWeight - startWeight) * 10) / 10;

    if (targetWeight !== null) {
      remainingToGoal = Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10;
      const totalDistance = Math.abs(startWeight - targetWeight);
      if (totalDistance > 0) {
        const achieved = Math.abs(startWeight - currentWeight);
        progressPercentage = Math.min(100, Math.max(0, Math.round((achieved / totalDistance) * 1000) / 10));
      }
    }
  } else if (activeGoal && typeof activeGoal.startWeight === "number") {
    startWeight = activeGoal.startWeight;
    if (targetWeight !== null) {
      remainingToGoal = Math.round(Math.abs(startWeight - targetWeight) * 10) / 10;
    }
  }

  // Highlight metrics from the HTML page
  let waistDelta = null;
  const waistRecords = measurements.filter((m) => typeof m.waist === "number");
  if (waistRecords.length >= 2) {
    const firstW = waistRecords[0].waist;
    const lastW = waistRecords[waistRecords.length - 1].waist;
    waistDelta = Math.round((lastW - firstW) * 10) / 10;
  }

  let chestDelta = null;
  const chestRecords = measurements.filter((m) => typeof m.chest === "number");
  if (chestRecords.length >= 2) {
    const firstC = chestRecords[0].chest;
    const lastC = chestRecords[chestRecords.length - 1].chest;
    chestDelta = Math.round((lastC - firstC) * 10) / 10;
  }

  let weeklyPace = null;
  if (measurements.length >= 2) {
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const dFirst = new Date(first.date);
    const dLast = new Date(last.date);
    const diffDays = (dLast - dFirst) / (1000 * 60 * 60 * 24);
    if (diffDays > 0) {
      const weeks = diffDays / 7;
      const deltaW = last.weight - first.weight;
      weeklyPace = Math.round((deltaW / weeks) * 10) / 10;
    }
  }

  const summary = {
    startWeight,
    currentWeight,
    targetWeight,
    totalChange,
    remainingToGoal,
    progressPercentage,
    waistDelta,
    chestDelta,
    weeklyPace,
  };

  res.json({
    success: true,
    data: {
      labels,
      datasets,
      timeline,
      startWeight,
      currentWeight,
      targetWeight,
      totalChange,
      remainingToGoal,
      progressPercentage,
      summary,
      goal: activeGoal || null,
    },
  });
}

