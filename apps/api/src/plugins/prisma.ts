import { prisma } from "@phingo/database";
import fp from "fastify-plugin";

export const prismaPlugin = fp(async (app) => {
  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
