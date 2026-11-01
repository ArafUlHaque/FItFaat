import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

try {
  await connectDB();
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  console.error("Check MONGODB_URI in server/.env and Network Access in Atlas.");
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`FitFaat API running on http://localhost:${env.port}/api/v1`);
});
