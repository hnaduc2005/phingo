import type { Prisma, PrismaClient } from "@phingo/database";

type SettingsClient = PrismaClient | Prisma.TransactionClient;

export const DEFAULT_SITE_SETTINGS = {
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
} as const;

export type PublicSiteSettings = Record<keyof typeof DEFAULT_SITE_SETTINGS, string>;

export const PUBLIC_SITE_SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as Array<keyof typeof DEFAULT_SITE_SETTINGS>;

export async function getSettingsMap(prisma: SettingsClient, keys: readonly string[]) {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [...keys]
      }
    }
  });

  return settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
}

export async function getPublicSiteSettings(prisma: SettingsClient): Promise<PublicSiteSettings> {
  const settingsMap = await getSettingsMap(prisma, PUBLIC_SITE_SETTING_KEYS);

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...settingsMap
  };
}

export function parseNonNegativeSetting(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function getShippingSettings(prisma: SettingsClient) {
  const settings = await getPublicSiteSettings(prisma);

  return {
    shippingFee: parseNonNegativeSetting(settings.shippingFee, Number(DEFAULT_SITE_SETTINGS.shippingFee)),
    freeShippingThreshold: parseNonNegativeSetting(
      settings.freeShippingThreshold,
      Number(DEFAULT_SITE_SETTINGS.freeShippingThreshold)
    )
  };
}
