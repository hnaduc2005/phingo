import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalTrimmedString } from "@phingo/shared";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";

const paymentDecisionSchema = z.object({
  transactionCode: optionalTrimmedString
});

export async function adminPaymentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const payments = await app.prisma.payment.findMany({
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true
              }
            }
          }
        },
        confirmedByAdmin: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Payments fetched", payments);
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const payment = await app.prisma.payment.findUnique({
      where: { id: request.params.id },
      include: {
        order: {
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true
              }
            }
          }
        },
        confirmedByAdmin: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!payment) {
      return fail(reply, "Payment not found", undefined, 404);
    }

    return ok(reply, "Payment fetched", payment);
  });

  app.patch<{ Params: { id: string } }>("/:id/confirm", async (request, reply) => {
    const body = paymentDecisionSchema.parse(request.body ?? {});
    const existing = await app.prisma.payment.findUnique({
      where: { id: request.params.id }
    });

    if (!existing) {
      return fail(reply, "Payment not found", undefined, 404);
    }

    const payment = await app.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: request.params.id },
        data: {
          status: "PAID",
          transactionCode: body.transactionCode,
          paidAt: new Date(),
          confirmedByAdminId: request.user.sub
        }
      });

      await tx.order.update({
        where: { id: existing.orderId },
        data: { paymentStatus: "PAID" }
      });

      return tx.payment.findUnique({
        where: { id: request.params.id },
        include: { order: true }
      });
    });

    return ok(reply, "Payment confirmed", payment);
  });

  app.patch<{ Params: { id: string } }>("/:id/reject", async (request, reply) => {
    const existing = await app.prisma.payment.findUnique({
      where: { id: request.params.id }
    });

    if (!existing) {
      return fail(reply, "Payment not found", undefined, 404);
    }

    const payment = await app.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: request.params.id },
        data: {
          status: "FAILED",
          confirmedByAdminId: request.user.sub
        }
      });

      await tx.order.update({
        where: { id: existing.orderId },
        data: { paymentStatus: "FAILED" }
      });

      return tx.payment.findUnique({
        where: { id: request.params.id },
        include: { order: true }
      });
    });

    return ok(reply, "Payment rejected", payment);
  });
}
