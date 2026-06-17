import type { FastifyInstance } from "fastify";
import { ok } from "../../utils/response";
import { getPublicSiteSettings } from "./site-setting.service";

export async function siteSettingRoutes(app: FastifyInstance) {
  app.get("/public", async (_request, reply) => {
    const settingsMap = await getPublicSiteSettings(app.prisma);

    return ok(reply, "Site settings fetched", settingsMap);
  });
}
