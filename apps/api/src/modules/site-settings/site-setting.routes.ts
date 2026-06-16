import type { FastifyInstance } from "fastify";
import { ok } from "../../utils/response";

export async function siteSettingRoutes(app: FastifyInstance) {
  app.get("/public", async (_request, reply) => {
    const settings = await app.prisma.siteSetting.findMany();
    
    // Transform into a key-value object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return ok(reply, "Site settings fetched", settingsMap);
  });
}
