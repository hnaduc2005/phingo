import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";
import { withDisplayStock } from "../products/product-stock";

export async function reportRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/overview", async (_request, reply) => {
    const [orders, customers, revenue, pendingOrders, pendingPayments] = await Promise.all([
      app.prisma.order.count(),
      app.prisma.user.count({ where: { role: "CUSTOMER" } }),
      app.prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalAmount: true }
      }),
      app.prisma.order.count({ where: { status: "PENDING" } }),
      app.prisma.payment.count({ where: { status: "PENDING" } })
    ]);

    return ok(reply, "Overview report fetched", {
      orders,
      customers,
      revenue: revenue._sum.totalAmount ?? 0,
      pendingOrders,
      pendingPayments
    });
  });

  app.get("/sales", async (_request, reply) => {
    const [byStatus, byPaymentStatus, totalCompleted] = await Promise.all([
      app.prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { totalAmount: true }
      }),
      app.prisma.order.groupBy({
        by: ["paymentStatus"],
        _count: { _all: true },
        _sum: { totalAmount: true }
      }),
      app.prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalAmount: true }
      })
    ]);

    return ok(reply, "Sales report fetched", {
      byStatus,
      byPaymentStatus,
      totalCompleted: totalCompleted._sum.totalAmount ?? 0
    });
  });

  app.get("/products", async (_request, reply) => {
    const products = await app.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        status: true,
        variants: {
          select: {
            stock: true
          }
        },
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Product report fetched", products.map(withDisplayStock));
  });

  app.get("/customers", async (_request, reply) => {
    const customers = await app.prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Customer report fetched", customers);
  });
}
