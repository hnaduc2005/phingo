import { categoryUpsertSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";

export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const categories = await app.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Categories fetched", categories);
  });

  app.post("/", async (request, reply) => {
    const body = categoryUpsertSchema.parse(request.body);
    const category = await app.prisma.category.create({
      data: body
    });

    return ok(reply, "Category created", category, 201);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = categoryUpsertSchema.partial().parse(request.body);
    const category = await app.prisma.category.update({
      where: { id: request.params.id },
      data: body
    });

    return ok(reply, "Category updated", category);
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const category = await app.prisma.category.findUnique({
      where: { id: request.params.id }
    });

    if (!category) {
      return fail(reply, "Category not found", undefined, 404);
    }

    await app.prisma.category.update({
      where: { id: request.params.id },
      data: { isActive: false }
    });

    return ok(reply, "Category hidden");
  });
}
