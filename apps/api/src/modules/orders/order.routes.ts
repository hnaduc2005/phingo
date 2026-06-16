import { createOrderSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { createOrder, getBankTransferInfo, InsufficientStockError } from "./order.service";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: requireRole(["CUSTOMER", "ADMIN"]) }, async (request, reply) => {
    const body = createOrderSchema.parse(request.body);
    try {
      const order = await createOrder(app.prisma, request.user.sub, body, request.log);

      return ok(reply, "Order created", order, 201);
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return fail(
          reply,
          "Một số sản phẩm không đủ tồn kho",
          {
            code: error.code,
            items: error.items
          },
          409
        );
      }

      return fail(reply, error instanceof Error ? error.message : "Cannot create order", undefined, 400);
    }
  });

  app.get<{ Params: { orderCode: string } }>("/track/:orderCode", async (request, reply) => {
    const order = await app.prisma.order.findUnique({
      where: { orderCode: request.params.orderCode },
      include: {
        items: true,
        payment: true
      }
    });

    if (!order) {
      return fail(reply, "Order not found", undefined, 404);
    }

    if (order.paymentMethod === "BANK_TRANSFER" && order.payment) {
      const bankInfo = await getBankTransferInfo(app.prisma);
      // Inject the settings directly so the frontend has access to qrImageUrl and transferContentTemplate
      Object.assign(order.payment, {
        qrImageUrl: bankInfo.qrImageUrl,
        transferContentTemplate: bankInfo.transferContentTemplate,
      });
    }

    return ok(reply, "Order tracked", order);
  });
}
