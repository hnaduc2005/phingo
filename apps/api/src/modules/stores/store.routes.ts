import type { FastifyInstance } from "fastify";
import { optionalTrimmedString } from "@phingo/shared";

import { ok } from "../../utils/response";

import { z } from "zod";

const storeQuerySchema = z.object({
  type: z.enum(["SHOWROOM", "DEALER", "CONVENIENCE_STORE", "COFFEE_SHOP", "GROCERY"]).optional(),
  city: optionalTrimmedString,
  district: optionalTrimmedString,
  keyword: optionalTrimmedString,
});

export async function storeRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const query = storeQuerySchema.parse(request.query);
    
    const stores = await app.prisma.storeLocation.findMany({
      where: { 
        isActive: true,
        ...(query.type && { type: query.type }),
        ...(query.city && { city: query.city }),
        ...(query.district && { district: query.district }),
        ...(query.keyword && {
          OR: [
            { name: { contains: query.keyword, mode: "insensitive" } },
            { address: { contains: query.keyword, mode: "insensitive" } },
          ]
        })
      },
      orderBy: [{ city: "asc" }, { district: "asc" }, { name: "asc" }]
    });

    return ok(reply, "Stores fetched", stores);
  });
}
