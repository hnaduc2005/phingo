import { z } from "zod";

import {
  flexibleBoolean,
  optionalId,
  optionalNumber,
  optionalTrimmedString,
  optionalUrlOrPath,
  requiredTrimmedString
} from "./helpers";

export const productUpsertSchema = z.object({
  categoryId: optionalId,
  name: requiredTrimmedString(2),
  slug: requiredTrimmedString(2),
  description: optionalTrimmedString,
  shortDescription: optionalTrimmedString,
  price: z.coerce.number().nonnegative(),
  compareAtPrice: optionalNumber.refine((value) => value === undefined || value >= 0, {
    message: "Compare at price must be greater than or equal to 0"
  }),
  sku: requiredTrimmedString(2),
  stock: z.coerce.number().int().nonnegative().default(0),
  imageUrl: optionalUrlOrPath,
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT")
});

export const productVariantUpsertSchema = z.object({
  name: requiredTrimmedString(2),
  sku: requiredTrimmedString(2),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().default(0),
  description: optionalTrimmedString
});

export const categoryUpsertSchema = z.object({
  name: requiredTrimmedString(2),
  slug: requiredTrimmedString(2),
  description: optionalTrimmedString,
  isActive: flexibleBoolean.default(true)
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
export type ProductVariantUpsertInput = z.infer<typeof productVariantUpsertSchema>;
export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;
