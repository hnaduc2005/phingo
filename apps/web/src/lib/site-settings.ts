import { apiFetch, type ApiResponse } from "@/lib/api";

export type PublicSiteSettings = Record<string, string>;

export const defaultPublicSiteSettings: PublicSiteSettings = {
  siteName: "PHIN GO",
  slogan: "Gói tinh hoa - Pha tốc độ",
  description: "Nội dung đang được cập nhật.",
  hotline: "1900 2026",
  phone: "1900 2026",
  email: "hello@phingo.vn",
  address: "",
  workingHours: "",
  facebookUrl: "",
  shopeeUrl: "",
  tiktokUrl: "",
  googleMapUrl: "",
  shippingFee: "25000",
  freeShippingThreshold: "300000",
  paymentMethod_COD: "true",
  paymentMethod_BANK_TRANSFER: "true",
  paymentMethod_MOMO: "false",
  paymentMethod_VNPAY: "false",
  paymentMethod_ZALOPAY: "false",
  paymentMethod_CREDIT_CARD: "false",
  bankName: "",
  bankAccountNumber: "",
  bankAccountHolder: "",
  bankQrImageUrl: "",
  bankTransferNoteTemplate: "PHINGO {orderCode}",
  heroTitle: "PHIN GO",
  heroSubtitle: "Chọn hương vị yêu thích, đăng nhập để checkout, áp mã giảm giá và theo dõi đơn hàng trong tài khoản của bạn.",
  heroImageUrl: "/images/img-1.png",
  guideTitle: "4 bước đơn giản chuẩn vị phin Việt",
  guideSubtitle: "Nội dung đang được cập nhật.",
  guideImageUrl: "/images/img-2.png",
  ctaTitle: "Chọn hương vị yêu thích, đặt hàng nhanh và theo dõi đơn trong tài khoản.",
  ctaSubtitle: "Nội dung đang được cập nhật.",
  ctaImageUrl: "/images/img-3.png"
};

export async function fetchPublicSiteSettings() {
  const response = await apiFetch<ApiResponse<PublicSiteSettings>>("/api/site-settings/public");

  return {
    ...defaultPublicSiteSettings,
    ...(response.data ?? {})
  };
}

export function getNumberSetting(settings: PublicSiteSettings, key: string, fallback: number) {
  const parsed = Number(settings[key]);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function getShippingFeeForSubtotal(settings: PublicSiteSettings, subtotal: number) {
  const shippingFee = getNumberSetting(settings, "shippingFee", 25000);
  const freeShippingThreshold = getNumberSetting(settings, "freeShippingThreshold", 300000);

  return subtotal >= freeShippingThreshold ? 0 : shippingFee;
}
