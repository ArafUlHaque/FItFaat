import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load server/.env no matter which folder the command is run from.
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });

const isTest = process.env.NODE_ENV === "test";

function required(name) {
  const value = process.env[name];
  if (!value && !isTest) {
    throw new Error(`Missing ${name} in server/.env. Copy server/.env.example and fill it in.`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET") || "test-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  dnsServers: (process.env.DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean),
};
