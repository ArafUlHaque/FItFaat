import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { isDBConnected } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";

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
// Feature routes go here, one line per module, e.g.
// app.use("/api/v1/favourites", favouriteRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
