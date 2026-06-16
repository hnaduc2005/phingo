import { paymentProofSchema } from "@phingo/shared";
import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { getPaymentMethodMeta } from "../orders/order.service";

export async function paymentRoutes(app: FastifyInstance) {
  app.get("/methods", async (_request, reply) => {
    const methods = await getPaymentMethodMeta(app.prisma);

    return ok(reply, "Payment methods fetched", methods);
  });

  app.post(
    "/bank-transfer-proof",
    { preHandler: requireRole(["CUSTOMER", "ADMIN"]) },
    async (request, reply) => {
      const body = paymentProofSchema.parse(request.body);
      const order = await app.prisma.order.findFirst({
        where: {
          id: body.orderId,
          customerId: request.user.sub,
          paymentMethod: "BANK_TRANSFER"
        },
        include: { payment: true }
      });

      if (!order || !order.payment) {
        return fail(reply, "Bank transfer order not found", undefined, 404);
      }

      const payment = await app.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          transferImageUrl: body.transferImageUrl,
          transactionCode: body.transactionCode,
          status: "PENDING"
        }
      });

      return ok(reply, "Payment proof submitted", payment);
    }
  );
}
