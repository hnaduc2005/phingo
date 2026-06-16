"use client";

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { siteConfig } from "@/config/site"
import { apiFetch, type ApiResponse } from "@/lib/api"
import { MessageCircle, MapPin, Phone, Mail, ShoppingBag } from "lucide-react"

export function PublicFooter() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch<ApiResponse<Record<string, string>>>("/api/site-settings/public");
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="border-t border-brand-gold/20 bg-brand-coffee py-16 text-brand-cream">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-4">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="mb-4 inline-block">
            <span className="text-3xl font-bold tracking-tight text-white">
              PHIN <span className="text-brand-mustard text-glow">GO</span>
            </span>
          </Link>
          <p className="mb-6 max-w-sm leading-relaxed text-brand-beige/80">
            {settings.description || siteConfig.description}
          </p>
          <div className="space-y-2 text-sm text-brand-beige/60">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Hotline: {settings.hotline || siteConfig.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Email: {settings.email || siteConfig.email}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{settings.address || "123 Đường Cà Phê, Quận 1, TP.HCM"}</span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="text-brand-beige/80 hover:text-brand-mustard">
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            {settings.shopeeUrl && (
              <a href={settings.shopeeUrl} target="_blank" rel="noreferrer" className="text-brand-beige/80 hover:text-brand-mustard">
                <ShoppingBag className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-lg font-semibold text-brand-gold">Liên kết nhanh</h4>
          <ul className="space-y-3 text-brand-beige/80">
            <li><Link href="/products" className="transition-colors hover:text-brand-mustard">Sản phẩm</Link></li>
            <li><Link href="/guide" className="transition-colors hover:text-brand-mustard">Hướng dẫn pha</Link></li>
            <li><Link href="/stores" className="transition-colors hover:text-brand-mustard">Điểm bán</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-brand-mustard">Liên hệ hợp tác</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-lg font-semibold text-brand-gold">Tài khoản</h4>
          <ul className="space-y-3 text-brand-beige/80">
            <li><Link href="/login" className="transition-colors hover:text-brand-mustard">Đăng nhập</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-brand-mustard">Đăng ký</Link></li>
            <li><Link href="/account/orders" className="transition-colors hover:text-brand-mustard">Đơn hàng của tôi</Link></li>
            <li><Link href="/cart" className="transition-colors hover:text-brand-mustard">Giỏ hàng</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 border-t border-white/10 px-4 pt-8 text-center text-sm text-brand-beige/50">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
