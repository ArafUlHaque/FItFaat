import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getMySubscription } from "./subscription.controller.js";

const router = Router();

// Protect every endpoint using Member 1's authentication middleware
router.use(requireAuth);

router.get("/me", getMySubscription);

export default router;
