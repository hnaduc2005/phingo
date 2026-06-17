"use client";

import { Save, UploadCloud } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { isRemoteImageSrc, isSafeImageSrc } from "@/lib/image-src";
import { defaultPublicSiteSettings } from "@/lib/site-settings";

type SettingsForm = Record<string, string>;

type SiteSettingRecord = {
  key: string;
  value: string;
};

const settingKeys = Object.keys(defaultPublicSiteSettings);

const urlKeys = new Set([
  "facebookUrl",
  "shopeeUrl",
  "tiktokUrl",
  "googleMapUrl",
  "heroImageUrl",
  "guideImageUrl",
  "ctaImageUrl"
]);

const imageKeys = new Set(["bankQrImageUrl"]);

const paymentMethods = [
  { key: "paymentMethod_COD", label: "COD" },
  { key: "paymentMethod_BANK_TRANSFER", label: "Chuyển khoản" },
  { key: "paymentMethod_MOMO", label: "Momo" },
  { key: "paymentMethod_VNPAY", label: "VNPAY" },
  { key: "paymentMethod_ZALOPAY", label: "ZaloPay" },
  { key: "paymentMethod_CREDIT_CARD", label: "Thẻ tín dụng" }
];

function inferSettingType(key: string) {
  if (imageKeys.has(key)) {
    return "IMAGE";
  }

  if (urlKeys.has(key)) {
    return "URL";
  }

  return "TEXT";
}

function inferSettingGroup(key: string) {
  if (key.startsWith("paymentMethod_") || key.startsWith("bank")) {
    return "payment";
  }

  if (key === "shippingFee" || key === "freeShippingThreshold") {
    return "shipping";
  }

  if (key.startsWith("hero") || key.startsWith("guide") || key.startsWith("cta")) {
    return "marketing";
  }

  return "general";
}

function isValidHttpUrl(value?: string) {
  if (!value?.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function AdminSettingsField({
  label,
  children,
  help
}: {
  label: string;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {help ? <p className="mt-1 text-xs text-gray-500">{help}</p> : null}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<SettingsForm>({
    defaultValues: defaultPublicSiteSettings
  });

  const qrImageUrl = watch("bankQrImageUrl");
  const canPreviewQrImage = isSafeImageSrc(qrImageUrl);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response = await apiFetch<ApiResponse<SiteSettingRecord[]>>("/api/admin/site-settings");
        const settingsMap = (response.data ?? []).reduce<SettingsForm>((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        if (!cancelled) {
          reset({
            ...defaultPublicSiteSettings,
            ...settingsMap
          });
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: "error", text: err instanceof Error ? err.message : "Không thể tải cấu hình." });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [reset]);

  function handleQrUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ảnh không được vượt quá 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setValue("bankQrImageUrl", base64, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: SettingsForm) {
    setSaving(true);
    setMessage(null);

    const shippingFee = Number(data.shippingFee);
    const freeShippingThreshold = Number(data.freeShippingThreshold);

    if (!Number.isFinite(shippingFee) || shippingFee < 0 || !Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
      setSaving(false);
      setMessage({ type: "error", text: "Phí vận chuyển và ngưỡng miễn phí phải là số không âm." });
      return;
    }

    const invalidUrlKey = ["facebookUrl", "shopeeUrl", "tiktokUrl", "googleMapUrl"].find((key) => !isValidHttpUrl(data[key]));
    if (invalidUrlKey) {
      setSaving(false);
      setMessage({ type: "error", text: "URL mạng xã hội/bản đồ phải bắt đầu bằng http hoặc https." });
      return;
    }

    const invalidImageKey = ["heroImageUrl", "guideImageUrl", "ctaImageUrl", "bankQrImageUrl"].find(
      (key) => data[key]?.trim() && !isSafeImageSrc(data[key])
    );
    if (invalidImageKey) {
      setSaving(false);
      setMessage({ type: "error", text: "URL ảnh phải là đường dẫn nội bộ, http/https hoặc data image hợp lệ." });
      return;
    }

    try {
      const settings = settingKeys.map((key) => ({
        key,
        value: String(data[key] ?? ""),
        type: inferSettingType(key),
        group: inferSettingGroup(key)
      }));

      await apiFetch("/api/admin/site-settings", {
        method: "PATCH",
        body: JSON.stringify({ settings })
      });

      setMessage({ type: "success", text: "Lưu cài đặt thành công." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Lỗi khi lưu cài đặt." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt website</h1>
      </div>

      {message ? (
        <div
          className={`mb-6 rounded-lg border p-4 font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">Brand & site</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminSettingsField label="Tên site">
              <input {...register("siteName")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Slogan">
              <input {...register("slogan")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Mô tả footer" help="Nội dung ngắn hiển thị ở footer và fallback SEO nội bộ.">
              <textarea {...register("description")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Giờ làm việc">
              <textarea {...register("workingHours")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">Liên hệ & mạng xã hội</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminSettingsField label="Hotline">
              <input {...register("hotline")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Điện thoại">
              <input {...register("phone")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Email">
              <input {...register("email")} type="email" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Địa chỉ">
              <input {...register("address")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Facebook URL">
              <input {...register("facebookUrl")} type="url" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Shopee URL">
              <input {...register("shopeeUrl")} type="url" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="TikTok URL">
              <input {...register("tiktokUrl")} type="url" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Google Map URL">
              <input {...register("googleMapUrl")} type="url" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">Shipping</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminSettingsField label="Phí vận chuyển">
              <input {...register("shippingFee")} type="number" min="0" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Ngưỡng miễn phí">
              <input {...register("freeShippingThreshold")} type="number" min="0" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">Payment</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {paymentMethods.map((method) => (
              <label key={method.key} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={watch(method.key) === "true"}
                  onChange={(event) => setValue(method.key, event.target.checked ? "true" : "false", { shouldDirty: true })}
                />
                {method.label}
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <AdminSettingsField label="Tên ngân hàng">
              <input {...register("bankName")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Số tài khoản">
              <input {...register("bankAccountNumber")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Chủ tài khoản">
              <input {...register("bankAccountHolder")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <AdminSettingsField label="Ảnh QR ngân hàng" help="Ảnh hiển thị ở checkout khi khách chọn chuyển khoản.">
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
                  <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Chọn ảnh QR</span>
                  <span className="mt-1 text-xs text-gray-400">PNG, JPG, JPEG tối đa 2MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} />
                </label>
                <input type="hidden" {...register("bankQrImageUrl")} />
              </AdminSettingsField>
              <AdminSettingsField label="Nội dung chuyển khoản mẫu">
                <input
                  {...register("bankTransferNoteTemplate")}
                  placeholder="PHINGO {orderCode}"
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </AdminSettingsField>
            </div>

            {qrImageUrl ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Xem trước QR</span>
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                  {canPreviewQrImage ? (
                    <Image
                      src={qrImageUrl}
                      alt="QR Code Preview"
                      fill
                      className="object-contain p-2"
                      unoptimized={isRemoteImageSrc(qrImageUrl)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-red-600">
                      URL QR không hợp lệ
                    </div>
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setValue("bankQrImageUrl", "", { shouldDirty: true })}>
                  Xóa QR
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">Home / Marketing</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminSettingsField label="Hero title">
              <input {...register("heroTitle")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Hero image URL">
              <input {...register("heroImageUrl")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Hero subtitle">
              <textarea {...register("heroSubtitle")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Guide title">
              <input {...register("guideTitle")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Guide subtitle">
              <textarea {...register("guideSubtitle")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="Guide image URL">
              <input {...register("guideImageUrl")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="CTA title">
              <textarea {...register("ctaTitle")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="CTA image URL">
              <input {...register("ctaImageUrl")} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
            </AdminSettingsField>
            <AdminSettingsField label="CTA subtitle">
              <textarea {...register("ctaSubtitle")} className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </AdminSettingsField>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} className="min-w-[150px] bg-brand-coffee text-white hover:bg-brand-coffee/90">
            {saving ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Lưu cài đặt
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
