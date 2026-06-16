import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requiredTrimmedString } from "@phingo/shared";

import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

const contentSchema = z.object({
  key: requiredTrimmedString(2),
  title: requiredTrimmedString(2),
  slug: requiredTrimmedString(2),
  content: requiredTrimmedString(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED")
});

export async function adminContentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const pages = await app.prisma.contentPage.findMany({
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Content pages fetched", pages);
  });

  app.post("/", async (request, reply) => {
    const body = contentSchema.parse(request.body);
    const page = await app.prisma.contentPage.create({
      data: body
    });

    return ok(reply, "Content page created", page, 201);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = contentSchema.partial().parse(request.body);
    const page = await app.prisma.contentPage.update({
      where: { id: request.params.id },
      data: body
    });

    return ok(reply, "Content page updated", page);
  });
}
