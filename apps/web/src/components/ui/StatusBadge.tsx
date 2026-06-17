import {
  getContentStatusLabel,
  getContactStatusLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getProductStatusLabel,
  getUserStatusLabel
} from "@/lib/i18n/status-labels";
import { cn } from "@/lib/utils";

type StatusBadgeType = "order" | "payment" | "product" | "user" | "method" | "content" | "contact" | "generic";

type StatusBadgeProps = {
  type?: StatusBadgeType;
  value?: string;
  className?: string;
};

const successValues = new Set(["ACTIVE", "PAID", "COMPLETED", "DELIVERED", "PUBLISHED", "REPLIED"]);
const warningValues = new Set(["PENDING", "PROCESSING", "PACKING", "SHIPPING", "SHIPPED", "UNPAID", "NEW", "READ"]);
const dangerValues = new Set(["CANCELLED", "FAILED", "BANNED"]);
const neutralValues = new Set(["INACTIVE", "DRAFT", "REFUNDED", "ARCHIVED"]);

const toneClasses = {
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-gray-200 bg-gray-100 text-gray-700"
};

function getStatusTone(value?: string) {
  if (successValues.has(value ?? "")) {
    return "success";
  }

  if (warningValues.has(value ?? "")) {
    return "warning";
  }

  if (dangerValues.has(value ?? "")) {
    return "danger";
  }

  if (neutralValues.has(value ?? "")) {
    return "neutral";
  }

  return "neutral";
}

function getStatusLabel(type: StatusBadgeType, value?: string) {
  if (type === "order") {
    return getOrderStatusLabel(value);
  }

  if (type === "payment") {
    return getPaymentStatusLabel(value);
  }

  if (type === "product") {
    return getProductStatusLabel(value);
  }

  if (type === "user") {
    return getUserStatusLabel(value);
  }

  if (type === "method") {
    return getPaymentMethodLabel(value);
  }

  if (type === "content") {
    return getContentStatusLabel(value);
  }

  if (type === "contact") {
    return getContactStatusLabel(value);
  }

  return value ?? "Không xác định";
}

export function StatusBadge({ type = "generic", value, className }: StatusBadgeProps) {
  const tone = getStatusTone(value);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {getStatusLabel(type, value)}
    </span>
  );
}
