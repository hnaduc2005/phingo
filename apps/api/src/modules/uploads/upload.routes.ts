import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { flexibleBoolean, optionalTrimmedString, requiredTrimmedString, requiredUrlOrPath } from "@phingo/shared";

import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

const marketingMaterialSchema = z.object({
  title: requiredTrimmedString(2),
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  fileUrl: requiredUrlOrPath,
  description: optionalTrimmedString,
  isActive: flexibleBoolean.default(true)
});

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/materials", async (_request, reply) => {
    const materials = await app.prisma.marketingMaterial.findMany({
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Marketing materials fetched", materials);
  });

  app.post("/materials", async (request, reply) => {
    const body = marketingMaterialSchema.parse(request.body);
    const material = await app.prisma.marketingMaterial.create({
      data: body
    });

    return ok(reply, "Marketing material created", material, 201);
  });

  app.patch<{ Params: { id: string } }>("/materials/:id", async (request, reply) => {
    const body = marketingMaterialSchema.partial().parse(request.body);
    const material = await app.prisma.marketingMaterial.update({
      where: { id: request.params.id },
      data: body
    });

    return ok(reply, "Marketing material updated", material);
  });
}
