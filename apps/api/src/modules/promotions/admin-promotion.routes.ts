import type { FastifyInstance } from "fastify";
import {
  flexibleBoolean,
  optionalDate,
  optionalPositiveInt,
  optionalTrimmedString,
  requiredTrimmedString
} from "@phingo/shared";
import { z } from "zod";

import { requireRole } from "../../middlewares/require-role";
import { ok } from "../../utils/response";

const promotionBaseSchema = z.object({
  code: requiredTrimmedString(2).transform((value) => value.toUpperCase()),
  name: requiredTrimmedString(2),
  description: optionalTrimmedString,
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  startDate: optionalDate,
  endDate: optionalDate,
  usageLimit: optionalPositiveInt,
  isActive: flexibleBoolean.default(true)
});

function validatePromotionRules(
  value: {
    discountType?: "PERCENT" | "FIXED";
    discountValue?: number;
    startDate?: Date;
    endDate?: Date;
  },
  ctx: z.RefinementCtx
) {
  if (value.discountType === "PERCENT" && value.discountValue !== undefined && value.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Percent discount must be less than or equal to 100"
    });
  }

  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date must be after start date"
    });
  }
}

const promotionSchema = promotionBaseSchema.superRefine(validatePromotionRules);
const promotionUpdateSchema = promotionBaseSchema.partial().superRefine(validatePromotionRules);

export async function adminPromotionRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["ADMIN"]));

  app.get("/", async (_request, reply) => {
    const promotions = await app.prisma.promotion.findMany({
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Promotions fetched", promotions);
  });

  app.post("/", async (request, reply) => {
    const body = promotionSchema.parse(request.body);
    const promotion = await app.prisma.promotion.create({
      data: body
    });

    return ok(reply, "Promotion created", promotion, 201);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = promotionUpdateSchema.parse(request.body);
    const promotion = await app.prisma.promotion.update({
      where: { id: request.params.id },
      data: body
    });

    return ok(reply, "Promotion updated", promotion);
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    await app.prisma.promotion.delete({
      where: { id: request.params.id }
    });

    return ok(reply, "Promotion deleted");
  });
}
