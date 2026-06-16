import { updateOrderStatusSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { updateOrderStatus } from "./order.service";

export async function adminOrderRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const orders = await app.prisma.order.findMany({
      include: {
        items: true,
        payment: true,
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Orders fetched", orders);
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const order = await app.prisma.order.findUnique({
      where: { id: request.params.id },
      include: {
        items: true,
        payment: true,
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return fail(reply, "Order not found", undefined, 404);
    }

    return ok(reply, "Order fetched", order);
  });

  app.patch<{ Params: { id: string } }>("/:id/status", async (request, reply) => {
    const body = updateOrderStatusSchema.parse(request.body);
    try {
      const order = await updateOrderStatus(app.prisma, request.params.id, body.status);

      return ok(reply, "Order status updated", order);
    } catch (error) {
      return fail(reply, error instanceof Error ? error.message : "Cannot update order status", undefined, 400);
    }
  });

  app.patch<{ Params: { id: string } }>("/:id/cancel", async (request, reply) => {
    try {
      const order = await updateOrderStatus(app.prisma, request.params.id, "CANCELLED");

      return ok(reply, "Order cancelled", order);
    } catch (error) {
      return fail(reply, error instanceof Error ? error.message : "Cannot cancel order", undefined, 400);
    }
  });
}
