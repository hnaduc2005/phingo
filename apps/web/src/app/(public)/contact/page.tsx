"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { Phone, Mail, MapPin, Clock, MessageCircle, Map as MapIcon, Send, ShoppingBag } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  subject: z.string().optional(),
  message: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch<ApiResponse<Record<string, string>>>("/api/site-settings/public");
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await apiFetch("/api/contact-messages", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccessMsg("PHIN GO đã nhận được thông tin của bạn. Chúng tôi sẽ liên hệ lại sớm nhất.");
      reset();
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-brand-coffee text-brand-cream py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ PHIN GO</h1>
          <p className="text-lg text-brand-beige/80 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-brand-coffee mb-6">Thông tin liên hệ</h2>
            
            <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-brand-coffee/5">
              {settings.hotline && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-mustard/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-brand-mustard" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-coffee/60 font-medium">Hotline</p>
                    <a href={`tel:${settings.hotline}`} className="text-lg font-bold text-brand-coffee hover:text-brand-mustard transition-colors">
                      {settings.hotline}
                    </a>
                  </div>
                </div>
              )}

              {settings.email && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-mustard/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-mustard" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-coffee/60 font-medium">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-lg font-bold text-brand-coffee hover:text-brand-mustard transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {settings.address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-mustard/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-brand-mustard" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-coffee/60 font-medium">Địa chỉ</p>
                    <p className="text-lg font-medium text-brand-coffee leading-tight mt-1">
                      {settings.address}
                    </p>
                  </div>
                </div>
              )}

              {settings.workingHours && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-mustard/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-brand-mustard" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-coffee/60 font-medium">Giờ làm việc</p>
                    <p className="text-lg font-medium text-brand-coffee leading-tight mt-1">
                      {settings.workingHours}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-brand-coffee/10 flex flex-wrap gap-4">
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                {settings.shopeeUrl && (
                  <a href={settings.shopeeUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                    <ShoppingBag className="w-5 h-5" />
                  </a>
                )}
                {settings.googleMapUrl && (
                  <a href={settings.googleMapUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#34A853] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                    <MapIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-8 bg-brand-coffee/5 p-6 rounded-2xl border border-brand-coffee/10">
              <h3 className="text-lg font-bold text-brand-coffee mb-2">Liên hệ hợp tác đại lý/B2B</h3>
              <p className="text-brand-coffee/80 mb-4 text-sm">
                Bạn muốn trở thành điểm bán, đại lý hoặc đối tác phân phối PHIN GO? Hãy để lại thông tin, đội ngũ PHIN GO sẽ liên hệ lại.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-brand-coffee mb-6">Gửi tin nhắn</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-brand-coffee/5 space-y-5">
              {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 font-medium">
                  {successMsg}
                </div>
              )}
              
              {errorMsg && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-coffee mb-1">Họ và tên *</label>
                  <input 
                    {...register("name")}
                    type="text" 
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard"
                    placeholder="Nhập họ tên"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-coffee mb-1">Số điện thoại *</label>
                  <input 
                    {...register("phone")}
                    type="tel" 
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard"
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-coffee mb-1">Email</label>
                  <input 
                    {...register("email")}
                    type="email" 
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard"
                    placeholder="Nhập email (không bắt buộc)"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-coffee mb-1">Chủ đề</label>
                  <input 
                    {...register("subject")}
                    type="text" 
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard"
                    placeholder="Vấn đề cần hỗ trợ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-coffee mb-1">Nội dung *</label>
                <textarea 
                  {...register("message")}
                  rows={5}
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard resize-none"
                  placeholder="Nhập nội dung tin nhắn..."
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-brand-coffee hover:bg-brand-coffee/90 text-brand-cream rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : (
                  <>
                    <Send className="w-5 h-5" /> Gửi tin nhắn
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
