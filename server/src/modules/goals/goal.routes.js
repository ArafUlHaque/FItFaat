import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getActiveGoal, setOrUpdateGoal } from "./goal.controller.js";

const router = Router();

// Protect every endpoint using Member 1's authentication middleware
router.use(requireAuth);

router.get("/", getActiveGoal);
router.post("/", setOrUpdateGoal);

export default router;

