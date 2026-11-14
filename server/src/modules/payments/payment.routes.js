import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  getPaymentHistory,
  initiatePayment,
  verifyPayment,
} from "./payment.controller.js";

const router = Router();

// Protect every endpoint using Member 1's authentication middleware
router.use(requireAuth);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);

export default router;
