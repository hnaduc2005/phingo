import { productUpsertSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { syncProductStockFromVariantsIfAny, withDisplayStock } from "./product-stock";

export async function adminProductRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const products = await app.prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Products fetched", products.map(withDisplayStock));
  });

  app.post("/", async (request, reply) => {
    const body = productUpsertSchema.parse(request.body);
    const product = await app.prisma.product.create({
      data: body,
      include: {
        category: true,
        variants: true
      }
    });

    return ok(reply, "Product created", withDisplayStock(product), 201);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = productUpsertSchema.partial().parse(request.body);
    const product = await app.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: request.params.id },
        data: body
      });

      await syncProductStockFromVariantsIfAny(tx, request.params.id);

      return tx.product.findUnique({
        where: { id: request.params.id },
        include: {
          category: true,
          variants: true
        }
      });
    });

    if (!product) {
      return fail(reply, "Product not found", undefined, 404);
    }

    return ok(reply, "Product updated", withDisplayStock(product));
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const product = await app.prisma.product.findUnique({
      where: { id: request.params.id }
    });

    if (!product) {
      return fail(reply, "Product not found", undefined, 404);
    }

    await app.prisma.product.update({
      where: { id: request.params.id },
      data: { status: "INACTIVE" }
    });

    return ok(reply, "Product hidden");
  });
}
