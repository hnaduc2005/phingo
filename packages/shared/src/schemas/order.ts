import { z } from "zod";

import {
  flexibleBoolean,
  optionalId,
  optionalTrimmedString,
  optionalUrlOrPath,
  requiredTrimmedString,
  requiredUrlOrPath
} from "./helpers";

export const orderItemSchema = z.object({
  productId: requiredTrimmedString(1),
  variantId: optionalId,
  quantity: z.coerce.number().int().positive()
});

export const createOrderSchema = z.object({
  addressId: optionalId,
  shippingAddress: optionalTrimmedString.refine((value) => value === undefined || value.length >= 5, {
    message: "Shipping address must be at least 5 characters"
  }),
  customerName: optionalTrimmedString.refine((value) => value === undefined || value.length >= 2, {
    message: "Customer name must be at least 2 characters"
  }),
  customerPhone: optionalTrimmedString.refine((value) => value === undefined || value.length >= 8, {
    message: "Customer phone must be at least 8 characters"
  }),
  note: optionalTrimmedString,
  paymentMethod: z
    .enum(["COD", "BANK_TRANSFER", "MOMO", "VNPAY", "ZALOPAY", "CREDIT_CARD"])
    .default("COD"),
  promotionCode: optionalTrimmedString.transform((value) => value?.toUpperCase()),
  transferImageUrl: optionalUrlOrPath,
  transactionCode: optionalTrimmedString,
  items: z.array(orderItemSchema).optional().default([])
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELLED"])
});

export const addressSchema = z.object({
  receiverName: requiredTrimmedString(2),
  receiverPhone: requiredTrimmedString(10).regex(/^(0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại phải có 10 chữ số và đúng định dạng Việt Nam"),
  city: requiredTrimmedString(1),
  district: requiredTrimmedString(1),
  ward: requiredTrimmedString(1),
  addressLine: requiredTrimmedString(1),
  isDefault: flexibleBoolean.default(false)
});

export const paymentProofSchema = z.object({
  orderId: requiredTrimmedString(1),
  transferImageUrl: requiredUrlOrPath,
  transactionCode: optionalTrimmedString
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaymentProofInput = z.infer<typeof paymentProofSchema>;
