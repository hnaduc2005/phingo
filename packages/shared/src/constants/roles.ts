export const USER_ROLES = ["CUSTOMER", "ADMIN"] as const;
export const USER_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"] as const;
export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE"] as const;
export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED"
] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export const PAYMENT_METHODS = [
  "COD",
  "BANK_TRANSFER",
  "MOMO",
  "VNPAY",
  "ZALOPAY",
  "CREDIT_CARD"
] as const;
export const DISCOUNT_TYPES = ["PERCENT", "FIXED"] as const;
export const STORE_TYPES = [
  "SHOWROOM",
  "DEALER",
  "CONVENIENCE_STORE",
  "COFFEE_SHOP",
  "GROCERY"
] as const;
export const CONTENT_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export const MARKETING_MATERIAL_TYPES = ["IMAGE", "VIDEO", "DOCUMENT"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type DiscountType = (typeof DISCOUNT_TYPES)[number];
export type StoreType = (typeof STORE_TYPES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type MarketingMaterialType = (typeof MARKETING_MATERIAL_TYPES)[number];
