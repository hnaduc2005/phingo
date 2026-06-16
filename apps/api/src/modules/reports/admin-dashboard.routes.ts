import type { FastifyInstance } from "fastify";

import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

export async function adminDashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const [
      revenue,
      orderCount,
      customerCount,
      pendingOrders,
      pendingPayments,
      activeProductCount,
      storeCount,
      topProducts,
      recentOrders,
      pendingPaymentRecords,
      latestStores,
      completedOrders
    ] = await Promise.all([
        app.prisma.order.aggregate({
          where: { status: "COMPLETED" },
          _sum: { totalAmount: true }
        }),
        app.prisma.order.count(),
        app.prisma.user.count({ where: { role: "CUSTOMER" } }),
        app.prisma.order.count({ where: { status: "PENDING" } }),
        app.prisma.payment.count({ where: { status: "PENDING" } }),
        app.prisma.product.count({ where: { status: "ACTIVE" } }),
        app.prisma.storeLocation.count(),
        app.prisma.product.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: { orderItems: true }
            }
          },
          orderBy: {
            orderItems: {
              _count: "desc"
            }
          },
          take: 5
        }),
        app.prisma.order.findMany({
          include: {
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
          orderBy: { createdAt: "desc" },
          take: 8
        }),
        app.prisma.payment.findMany({
          where: { status: "PENDING" },
          include: {
            order: {
              select: {
                id: true,
                orderCode: true,
                customerName: true,
                totalAmount: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 6
        }),
        app.prisma.storeLocation.findMany({
          orderBy: { createdAt: "desc" },
          take: 5
        }),
        app.prisma.order.findMany({
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          select: {
            createdAt: true,
            totalAmount: true
          }
        })
      ]);
    const revenueByDay = completedOrders.reduce<Record<string, number>>((acc, order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + Number(order.totalAmount);
      return acc;
    }, {});

    return ok(reply, "Admin dashboard fetched", {
      totalRevenue: revenue._sum.totalAmount ?? 0,
      orderCount,
      customerCount,
      pendingOrders,
      pendingPayments,
      activeProductCount,
      storeCount,
      topProducts,
      recentOrders,
      pendingPaymentRecords,
      latestStores,
      revenueByDay: Object.entries(revenueByDay)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date))
    });
  });
}
