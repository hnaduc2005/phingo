export function formatCurrencyVND(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

export function formatDateTimeVN(value: string | number | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDateVN(value: string | number | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatNumberVN(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(Number(value ?? 0));
}
