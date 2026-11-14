import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { isDBConnected } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import exerciseRoutes from "./modules/exercises/exercise.routes.js";
import favouriteRoutes from "./modules/favourites/favourite.routes.js";
import programmeRoutes from "./modules/programmes/programme.routes.js";
import measurementRoutes from "./modules/measurements/measurement.routes.js";
import goalRoutes from "./modules/goals/goal.routes.js";
import packageRoutes from "./modules/packages/package.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    data: { status: "ok", database: isDBConnected() ? "connected" : "disconnected" },
  });
});

app.use("/api/v1/auth", authRoutes);
// Feature routes go here, one line per module.
app.use("/api/v1/exercises", exerciseRoutes); // Member 1: 4.1 Exercise library
app.use("/api/v1/favourites", favouriteRoutes); // Member 1: 4.1 Favourites
app.use("/api/v1/programmes", programmeRoutes); // Member 1: 4.7 Programme generator

// Feature 1: Body Measurements, Personal Goals, and Progress Charts (Member 3: 4.3)
app.use("/api/v1/measurements", measurementRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/goals", goalRoutes);

// Feature 2: Premium Packages, Internal Sandbox Payments & Subscriptions (Member 3: 4.12)
app.use("/api/v1/packages", packageRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
