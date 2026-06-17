export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại"
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Đã hủy"
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang bán",
  INACTIVE: "Ngừng bán",
  DRAFT: "Nháp",
  OUT_OF_STOCK: "Hết hàng"
};

export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BANNED: "Bị khóa"
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  ZALOPAY: "ZaloPay",
  CREDIT_CARD: "Thẻ tín dụng/ghi nợ"
};

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản"
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  NEW: "Mới",
  READ: "Đã đọc",
  REPLIED: "Đã phản hồi",
  ARCHIVED: "Đã lưu trữ"
};

function getLabel(labels: Record<string, string>, value?: string) {
  return labels[value ?? ""] ?? value ?? "Không xác định";
}

export function getOrderStatusLabel(status?: string) {
  return getLabel(ORDER_STATUS_LABELS, status);
}

export function getPaymentStatusLabel(status?: string) {
  return getLabel(PAYMENT_STATUS_LABELS, status);
}

export function getProductStatusLabel(status?: string) {
  return getLabel(PRODUCT_STATUS_LABELS, status);
}

export function getUserStatusLabel(status?: string) {
  return getLabel(USER_STATUS_LABELS, status);
}

export function getPaymentMethodLabel(method?: string) {
  return getLabel(PAYMENT_METHOD_LABELS, method);
}

export function getContentStatusLabel(status?: string) {
  return getLabel(CONTENT_STATUS_LABELS, status);
}

export function getContactStatusLabel(status?: string) {
  return getLabel(CONTACT_STATUS_LABELS, status);
}
