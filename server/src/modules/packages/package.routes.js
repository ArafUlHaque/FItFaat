import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { listPackages } from "./package.controller.js";

const router = Router();

// Protect every endpoint using Member 1's authentication middleware
router.use(requireAuth);

router.get("/", listPackages);

export default router;
