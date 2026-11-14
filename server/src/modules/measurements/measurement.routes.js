import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createMeasurement,
  deleteMeasurement,
  getMeasurementById,
  getProgress,
  listMeasurements,
  updateMeasurement,
} from "./measurement.controller.js";

const router = Router();

// Protect every endpoint using Member 1's authentication middleware
router.use(requireAuth);

// Order matters: /progress must precede /:id
router.get("/progress", getProgress);
router.get("/", listMeasurements);
router.post("/", createMeasurement);
router.get("/:id", getMeasurementById);
router.put("/:id", updateMeasurement);
router.delete("/:id", deleteMeasurement);

export default router;

