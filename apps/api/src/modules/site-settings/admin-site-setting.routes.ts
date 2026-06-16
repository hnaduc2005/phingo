import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalTrimmedString, requiredTrimmedString } from "@phingo/shared";
import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

const updateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: requiredTrimmedString(1),
    value: z.string(),
    type: z.enum(["TEXT", "JSON", "IMAGE", "URL"]).optional(),
    group: optionalTrimmedString
  }))
});

export async function adminSiteSettingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const settings = await app.prisma.siteSetting.findMany();
    return ok(reply, "Site settings fetched", settings);
  });

  app.patch("/", async (request, reply) => {
    const { settings } = updateSettingsSchema.parse(request.body);
    
    // Process upserts in a transaction
    await app.prisma.$transaction(
      settings.map((setting) => 
        app.prisma.siteSetting.upsert({
          where: { key: setting.key },
          update: { 
            value: setting.value,
            ...(setting.type && { type: setting.type }),
            ...(setting.group && { group: setting.group })
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type || "TEXT",
            group: setting.group
          }
        })
      )
    );

    return ok(reply, "Site settings updated successfully");
  });
}
