import { Package } from "./package.model.js";

export const SEED_PACKAGES = [
  {
    name: "Monthly Premium",
    code: "monthly",
    price: 499,
    currency: "BDT",
    durationDays: 30,
    features: [
      "50 AI Meal Photo Estimates / day",
      "AI Weekly Review & Macro suggestions",
      "Unlimited custom Recipe Nutrition saves",
      "Custom Target Goal deadlines",
      "Priority support",
    ],
    isActive: true,
  },
  {
    name: "Yearly Premium",
    code: "yearly",
    price: 3999,
    currency: "BDT",
    durationDays: 365,
    features: [
      "Higher AI Meal Photo Limits (Spec 4.2)",
      "AI Weekly Review & Recovery Insights (Spec 4.11)",
      "Advanced Measurements & Goal Trend Analytics",
      "Full Recipe Nutrition portion scaling",
      "Instant SSLCOMMERZ Sandbox verification",
    ],
    isActive: true,
  },
];

// GET /api/v1/packages or /api/packages
export async function listPackages(req, res) {
  let packages = await Package.find({ isActive: true }).sort({ price: 1 });

  if (!packages || packages.length === 0) {
    await Package.insertMany(SEED_PACKAGES);
    packages = await Package.find({ isActive: true }).sort({ price: 1 });
  }

  res.json({
    success: true,
    data: { packages },
  });
}
