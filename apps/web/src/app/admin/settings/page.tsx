"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, UploadCloud } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ảnh không được vượt quá 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setValue("bankQrImageUrl", base64, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const { register, handleSubmit, reset, watch, setValue } = useForm();
  
  const qrImageUrl = watch("bankQrImageUrl");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch<any>("/api/admin/site-settings");
      const data = res.data;
      const formData: any = {};
      data.forEach((item: any) => {
        formData[item.key] = item.value;
      });
      reset(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setMessage(null);
    try {
      const settingsArray = Object.keys(data).map(key => ({
        key,
        value: data[key],
        type: key.endsWith("Url") ? "URL" : "TEXT"
      })).filter(s => s.value); // Only save non-empty

      await apiFetch("/api/admin/site-settings", {
        method: "PATCH",
        body: JSON.stringify({ settings: settingsArray })
      });
      
      setMessage({ type: "success", text: "Lưu cài đặt thành công" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi khi lưu cài đặt" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt Website</h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Thông tin liên hệ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
              <input {...register("hotline")} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register("email")} type="email" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chính</label>
              <input {...register("address")} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc</label>
              <input {...register("workingHours")} type="text" placeholder="Ví dụ: Thứ 2 - Chủ Nhật: 8h00 - 22h00" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Mạng xã hội & Bản đồ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input {...register("facebookUrl")} type="url" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shopee URL</label>
              <input {...register("shopeeUrl")} type="url" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
              <input {...register("tiktokUrl")} type="url" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Map URL</label>
              <input {...register("googleMapUrl")} type="url" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
          </div>
        </div>

        {/* Bank Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Tài khoản ngân hàng (Thanh toán)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
              <input {...register("bankName")} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <input {...register("bankAccountNumber")} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản</label>
              <input {...register("bankAccountHolder")} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard" />
            </div>
            <div className="md:col-span-3 grid md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh QR Code (Thay vì URL, chọn file để tự upload)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Bấm vào đây để tải ảnh lên</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Tối đa 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} />
                  </label>
                  {/* Hidden input to hold the actual value for react-hook-form */}
                  <input type="hidden" {...register("bankQrImageUrl")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chuyển khoản mẫu</label>
                  <input
                    {...register("bankTransferNoteTemplate")}
                    type="text"
                    placeholder="PHINGO {orderCode}"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard"
                  />
                </div>
              </div>
              
              {qrImageUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-gray-700">Xem trước QR</span>
                  <div className="relative w-32 h-32 rounded-lg border border-gray-200 bg-white p-2 shadow-sm overflow-hidden flex items-center justify-center">
                    <Image src={qrImageUrl} alt="QR Code Preview" fill className="object-contain p-2" unoptimized={qrImageUrl.startsWith("http")} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} className="bg-brand-coffee hover:bg-brand-coffee/90 text-white min-w-[150px]">
            {saving ? "Đang lưu..." : (
              <>
                <Save className="w-4 h-4 mr-2" /> Lưu cài đặt
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
