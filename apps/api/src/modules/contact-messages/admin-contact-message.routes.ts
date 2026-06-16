import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"])
});

export async function adminContactMessageRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const messages = await app.prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    });
    return ok(reply, "Messages fetched", messages);
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const message = await app.prisma.contactMessage.findUnique({
      where: { id: request.params.id }
    });
    return ok(reply, "Message fetched", message);
  });

  app.patch<{ Params: { id: string } }>("/:id/status", async (request, reply) => {
    const { status } = updateStatusSchema.parse(request.body);
    
    const message = await app.prisma.contactMessage.update({
      where: { id: request.params.id },
      data: { status }
    });

    return ok(reply, "Message status updated", message);
  });
}
