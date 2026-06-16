import cors from "@fastify/cors";
import fp from "fastify-plugin";

import { env } from "../config/env";

export const corsPlugin = fp(async (app) => {
  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  await app.register(cors, {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      callback(new Error("Origin is not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });
});
