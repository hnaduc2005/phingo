import { addressSchema, nullableTrimmedString, optionalTrimmedString } from "@phingo/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";
import { updateOrderStatus } from "../orders/order.service";

const profileSchema = z.object({
  name: optionalTrimmedString.refine((value) => value === undefined || value.length >= 2, {
    message: "Name must be at least 2 characters"
  }),
  phone: nullableTrimmedString
});

function formatAddress(address: {
  addressLine: string;
  ward: string;
  district: string;
  city: string;
}) {
  return `${address.addressLine}, ${address.ward}, ${address.district}, ${address.city}`;
}

export async function accountRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["CUSTOMER", "ADMIN"]));

  app.get("/profile", async (request, reply) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return fail(reply, "User not found", undefined, 404);
    }

    return ok(reply, "Profile fetched", user);
  });

  app.patch("/profile", async (request, reply) => {
    const body = profileSchema.parse(request.body);
    const user = await app.prisma.user.update({
      where: { id: request.user.sub },
      data: body,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true
      }
    });

    return ok(reply, "Profile updated", user);
  });

  app.get("/addresses", async (request, reply) => {
    const addresses = await app.prisma.customerAddress.findMany({
      where: { userId: request.user.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return ok(reply, "Addresses fetched", addresses);
  });

  app.post("/addresses", async (request, reply) => {
    const body = addressSchema.parse(request.body);

    if (body.isDefault) {
      await app.prisma.customerAddress.updateMany({
        where: { userId: request.user.sub },
        data: { isDefault: false }
      });
    }

    const address = await app.prisma.customerAddress.create({
      data: {
        userId: request.user.sub,
        receiverName: body.receiverName,
        receiverPhone: body.receiverPhone,
        city: body.city,
        district: body.district,
        ward: body.ward,
        addressLine: body.addressLine,
        isDefault: Boolean(body.isDefault)
      }
    });

    return ok(reply, "Address created", address, 201);
  });

  app.patch<{ Params: { id: string } }>("/addresses/:id", async (request, reply) => {
    const body = addressSchema.partial().parse(request.body);
    const existing = await app.prisma.customerAddress.findFirst({
      where: {
        id: request.params.id,
        userId: request.user.sub
      }
    });

    if (!existing) {
      return fail(reply, "Address not found", undefined, 404);
    }

    if (body.isDefault) {
      await app.prisma.customerAddress.updateMany({
        where: { userId: request.user.sub },
        data: { isDefault: false }
      });
    }

    const address = await app.prisma.customerAddress.update({
      where: { id: request.params.id },
      data: {
        ...(body.receiverName !== undefined && { receiverName: body.receiverName }),
        ...(body.receiverPhone !== undefined && { receiverPhone: body.receiverPhone }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.district !== undefined && { district: body.district }),
        ...(body.ward !== undefined && { ward: body.ward }),
        ...(body.addressLine !== undefined && { addressLine: body.addressLine }),
        ...(body.isDefault !== undefined && { isDefault: Boolean(body.isDefault) })
      }
    });

    return ok(reply, "Address updated", address);
  });

  app.delete<{ Params: { id: string } }>("/addresses/:id", async (request, reply) => {
    const existing = await app.prisma.customerAddress.findFirst({
      where: {
        id: request.params.id,
        userId: request.user.sub
      }
    });

    if (!existing) {
      return fail(reply, "Address not found", undefined, 404);
    }

    await app.prisma.customerAddress.delete({
      where: { id: request.params.id }
    });

    return ok(reply, "Address deleted");
  });

  app.get("/orders", async (request, reply) => {
    const orders = await app.prisma.order.findMany({
      where: { customerId: request.user.sub },
      include: {
        items: true,
        payment: true
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Orders fetched", orders);
  });

  app.get<{ Params: { id: string } }>("/orders/:id", async (request, reply) => {
    const order = await app.prisma.order.findFirst({
      where: {
        id: request.params.id,
        customerId: request.user.sub
      },
      include: {
        items: true,
        payment: true
      }
    });

    if (!order) {
      return fail(reply, "Order not found", undefined, 404);
    }

    return ok(reply, "Order fetched", order);
  });

  app.patch<{ Params: { id: string } }>("/orders/:id/cancel", async (request, reply) => {
    const order = await app.prisma.order.findFirst({
      where: {
        id: request.params.id,
        customerId: request.user.sub
      },
      include: { payment: true }
    });

    if (!order) {
      return fail(reply, "Order not found", undefined, 404);
    }

    if (order.status !== "PENDING") {
      return fail(reply, "Only pending orders can be cancelled", { status: order.status }, 400);
    }

    let updated;
    try {
      updated = await updateOrderStatus(app.prisma, order.id, "CANCELLED");
    } catch (error) {
      return fail(reply, error instanceof Error ? error.message : "Cannot cancel order", undefined, 400);
    }

    return ok(reply, "Order cancelled", updated);
  });
}

export { formatAddress };
