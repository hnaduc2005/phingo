import { buildApp } from "./app";
import { env } from "./config/env";

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

const close = async () => {
  await app.close();
  process.exit(0);
};

process.on("SIGINT", close);
process.on("SIGTERM", close);
