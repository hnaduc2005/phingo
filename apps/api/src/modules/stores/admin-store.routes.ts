import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  flexibleBoolean,
  nullableNumber,
  nullableTrimmedString,
  nullableUrlOrPath,
  optionalFlexibleBoolean,
  optionalTrimmedString,
  requiredTrimmedString
} from "@phingo/shared";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";

const storeSchema = z.object({
  name: requiredTrimmedString(2),
  type: z.enum(["SHOWROOM", "DEALER", "CONVENIENCE_STORE", "COFFEE_SHOP", "GROCERY"]),
  address: requiredTrimmedString(5),
  city: requiredTrimmedString(2),
  district: requiredTrimmedString(2),
  ward: nullableTrimmedString,
  phone: nullableTrimmedString,
  openingHours: nullableTrimmedString,
  googleMapUrl: nullableUrlOrPath,
  description: nullableTrimmedString,
  latitude: nullableNumber,
  longitude: nullableNumber,
  isActive: flexibleBoolean.default(true)
});

const storeQuerySchema = z.object({
  keyword: optionalTrimmedString,
  type: z.enum(["SHOWROOM", "DEALER", "CONVENIENCE_STORE", "COFFEE_SHOP", "GROCERY"]).optional(),
  city: optionalTrimmedString,
  district: optionalTrimmedString,
  isActive: optionalFlexibleBoolean
});

export async function adminStoreRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (request, reply) => {
    const query = storeQuerySchema.parse(request.query);
    const stores = await app.prisma.storeLocation.findMany({
      where: {
        ...(query.type && { type: query.type }),
        ...(query.city && { city: query.city }),
        ...(query.district && { district: query.district }),
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.keyword && {
          OR: [
            { name: { contains: query.keyword, mode: "insensitive" } },
            { address: { contains: query.keyword, mode: "insensitive" } },
            { city: { contains: query.keyword, mode: "insensitive" } },
            { district: { contains: query.keyword, mode: "insensitive" } },
            { phone: { contains: query.keyword, mode: "insensitive" } }
          ]
        })
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Stores fetched", stores);
  });

  app.post("/", async (request, reply) => {
    const body = storeSchema.parse(request.body);
    const store = await app.prisma.storeLocation.create({
      data: body
    });

    return ok(reply, "Store created", store, 201);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = storeSchema.partial().parse(request.body);
    const existing = await app.prisma.storeLocation.findUnique({
      where: { id: request.params.id }
    });

    if (!existing) {
      return fail(reply, "Store not found", undefined, 404);
    }

    const store = await app.prisma.storeLocation.update({
      where: { id: request.params.id },
      data: body
    });

    return ok(reply, "Store updated", store);
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const existing = await app.prisma.storeLocation.findUnique({
      where: { id: request.params.id }
    });

    if (!existing) {
      return fail(reply, "Store not found", undefined, 404);
    }

    await app.prisma.storeLocation.update({
      where: { id: request.params.id },
      data: { isActive: false }
    });

    return ok(reply, "Store hidden");
  });
}
