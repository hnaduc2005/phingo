import cors from "@fastify/cors";
import fp from "fastify-plugin";

import { env } from "../config/env";

export const corsPlugin = fp(async (app) => {
  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"), false);
    }
  });
});
