import type { FastifyInstance } from "fastify";

import { ok } from "../../utils/response";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const categories = await app.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return ok(reply, "Categories fetched", categories);
  });
}
