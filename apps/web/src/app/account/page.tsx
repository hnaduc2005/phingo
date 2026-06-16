"use client";

import { MapPin, PackageSearch, UserRound } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";

const quickLinks = [
  { href: "/account/profile", label: "Cập nhật hồ sơ", icon: UserRound },
  { href: "/account/addresses", label: "Quản lý địa chỉ", icon: MapPin },
  { href: "/account/orders", label: "Xem đơn hàng", icon: PackageSearch },
];

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <section className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-brand-coffee">Tài khoản</h1>
      <p className="mt-3 text-brand-coffee/70">
        Xin chào {user?.name}. Quản lý hồ sơ, địa chỉ giao hàng, lịch sử đơn hàng và trạng thái thanh toán của bạn.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="rounded-lg border border-brand-coffee/10 p-5 transition hover:bg-brand-beige">
              <Icon className="h-6 w-6 text-brand-mustard" />
              <p className="mt-3 font-semibold text-brand-coffee">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
