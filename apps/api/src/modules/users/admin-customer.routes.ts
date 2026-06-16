import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";

const customerStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"])
});

export async function adminCustomerRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const customers = await app.prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Customers fetched", customers);
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const customer = await app.prisma.user.findFirst({
      where: {
        id: request.params.id,
        role: "CUSTOMER"
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          include: {
            payment: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!customer) {
      return fail(reply, "Customer not found", undefined, 404);
    }

    return ok(reply, "Customer fetched", customer);
  });

  app.patch<{ Params: { id: string } }>("/:id/status", async (request, reply) => {
    const body = customerStatusSchema.parse(request.body);
    const customer = await app.prisma.user.update({
      where: { id: request.params.id },
      data: { status: body.status },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true
      }
    });

    return ok(reply, "Customer status updated", customer);
  });
}
