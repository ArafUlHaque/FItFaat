import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Package } from "../packages/package.model.js";
import { PaymentTransaction } from "./paymentTransaction.model.js";
import { activateUserSubscription } from "./payment.service.js";

export { activateUserSubscription };

// POST /api/v1/payments/initiate or /api/payments/initiate
export async function initiatePayment(req, res) {
  const { packageId, code, packageCode } = req.body || {};

  let pkg = null;
  if (packageId) {
    if (mongoose.Types.ObjectId.isValid(packageId)) {
      pkg = await Package.findById(packageId);
    }
  }

  if (!pkg && (code || packageCode)) {
    pkg = await Package.findOne({
      code: (code || packageCode).toLowerCase(),
      isActive: true,
    });
  }

  if (!pkg || !pkg.isActive) {
    throw new ApiError(400, "Validation failed", {
      package: "A valid, active packageId or package code is required",
    });
  }

  // TODO: Replace internal simulation with external SSLCOMMERZ API call
  // When integrating live SSLCOMMERZ:
  // Call SSLCOMMERZ Session API (POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php)
  // with store_id, store_passwd, total_amount, currency, tran_id, success_url, fail_url, cancel_url
  // and redirect the client to the returned GatewayPageURL.
  const tranId = `SSLCZ_TEST_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const transaction = await PaymentTransaction.create({
    userId: req.user._id,
    packageId: pkg._id,
    tranId,
    amount: pkg.price,
    currency: pkg.currency || "BDT",
    gateway: "SSLCOMMERZ_SANDBOX",
    status: "pending",
  });

  res.status(201).json({
    success: true,
    data: {
      transaction,
      package: pkg,
      gatewayUrl: `/sandbox/sslcommerz?tranId=${tranId}`,
    },
  });
}

// POST /api/v1/payments/verify or /api/payments/verify
export async function verifyPayment(req, res) {
  const { tranId, status } = req.body || {};

  if (!tranId || typeof tranId !== "string") {
    throw new ApiError(400, "Validation failed", {
      tranId: "tranId is required and must be a string",
    });
  }

  const validStatuses = ["success", "failed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, "Validation failed", {
      status: "status must be one of: 'success', 'failed', 'cancelled'",
    });
  }

  const transaction = await PaymentTransaction.findOne({ tranId });
  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  if (transaction.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to verify this transaction");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(
      400,
      `Transaction has already been processed with status '${transaction.status}'`,
    );
  }

  const pkg = await Package.findById(transaction.packageId);
  if (!pkg) {
    throw new ApiError(404, "Associated package not found");
  }

  // TODO: Replace internal simulation with external SSLCOMMERZ API call
  // When integrating live SSLCOMMERZ:
  // Call SSLCOMMERZ Order Validation API (GET https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php)
  // passing val_id, store_id, and store_passwd to cryptographically verify settlement before fulfilling.
  transaction.status = status;
  transaction.verifiedAt = new Date();

  let subscription = null;
  if (status === "success") {
    transaction.valId = `SSLCZ_VAL_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    subscription = await activateUserSubscription(req.user._id, pkg, transaction);
  }

  await transaction.save();

  res.json({
    success: true,
    data: {
      transaction,
      subscription,
    },
  });
}

// GET /api/v1/payments/history or /api/payments/history
export async function getPaymentHistory(req, res) {
  const transactions = await PaymentTransaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("packageId", "name code price currency durationDays features");

  res.json({
    success: true,
    data: {
      transactions,
    },
  });
}
