import { productVariantUpsertSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { syncProductStockFromVariants } from "./product-stock";

export async function adminProductVariantRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get<{ Params: { productId: string } }>("/products/:productId/variants", async (request, reply) => {
    const product = await app.prisma.product.findUnique({
      where: { id: request.params.productId },
      select: { id: true }
    });

    if (!product) {
      return fail(reply, "Product not found", undefined, 404);
    }

    const variants = await app.prisma.productVariant.findMany({
      where: { productId: request.params.productId },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Product variants fetched", variants);
  });

  app.post<{ Params: { productId: string } }>("/products/:productId/variants", async (request, reply) => {
    const body = productVariantUpsertSchema.parse(request.body);
    const product = await app.prisma.product.findUnique({
      where: { id: request.params.productId },
      select: { id: true }
    });

    if (!product) {
      return fail(reply, "Product not found", undefined, 404);
    }

    const variant = await app.prisma.$transaction(async (tx) => {
      const created = await tx.productVariant.create({
        data: {
          ...body,
          productId: request.params.productId
        }
      });

      await syncProductStockFromVariants(tx, request.params.productId);

      return created;
    });

    return ok(reply, "Product variant created", variant, 201);
  });

  app.patch<{ Params: { id: string } }>("/product-variants/:id", async (request, reply) => {
    const body = productVariantUpsertSchema.partial().parse(request.body);
    const existing = await app.prisma.productVariant.findUnique({
      where: { id: request.params.id }
    });

    if (!existing) {
      return fail(reply, "Product variant not found", undefined, 404);
    }

    const variant = await app.prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id: request.params.id },
        data: body
      });

      await syncProductStockFromVariants(tx, existing.productId);

      return updated;
    });

    return ok(reply, "Product variant updated", variant);
  });

  app.delete<{ Params: { id: string } }>("/product-variants/:id", async (request, reply) => {
    const existing = await app.prisma.productVariant.findUnique({
      where: { id: request.params.id },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true
          }
        }
      }
    });

    if (!existing) {
      return fail(reply, "Product variant not found", undefined, 404);
    }

    await app.prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({
        where: { id: request.params.id }
      });

      await syncProductStockFromVariants(tx, existing.productId);
    });

    return ok(reply, "Product variant deleted", {
      detachedOrderItems: existing._count.orderItems,
      detachedCartItems: existing._count.cartItems
    });
  });
}
