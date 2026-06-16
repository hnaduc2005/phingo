import type { FastifyInstance } from "fastify";

import { fail, ok } from "../../utils/response";

export async function promotionRoutes(app: FastifyInstance) {
  app.get<{ Params: { code: string } }>("/validate/:code", async (request, reply) => {
    const now = new Date();
    const promotion = await app.prisma.promotion.findUnique({
      where: { code: request.params.code.toUpperCase() }
    });

    if (!promotion || !promotion.isActive) {
      return fail(reply, "Promotion is not valid", undefined, 404);
    }

    if (promotion.startDate && promotion.startDate > now) {
      return fail(reply, "Promotion has not started", undefined, 400);
    }

    if (promotion.endDate && promotion.endDate < now) {
      return fail(reply, "Promotion has expired", undefined, 400);
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return fail(reply, "Promotion usage limit reached", undefined, 400);
    }

    return ok(reply, "Promotion is valid", {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue
    });
  });
}
