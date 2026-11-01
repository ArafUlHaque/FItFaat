import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  // Some Windows setups give Node a DNS server that can't resolve Atlas
  // "mongodb+srv" addresses (querySrv ECONNREFUSED). DNS_SERVERS overrides it.
  if (env.dnsServers.length) dns.setServers(env.dnsServers);

  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected: ${host}/${name}`);
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
