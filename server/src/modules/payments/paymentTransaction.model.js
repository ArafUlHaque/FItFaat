import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    tranId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "BDT",
      trim: true,
    },
    gateway: {
      type: String,
      default: "SSLCOMMERZ_SANDBOX",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    valId: {
      type: String,
      default: null,
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: cleanJSON,
  },
);

export const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);
