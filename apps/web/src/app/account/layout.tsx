"use client";

import { Home, LogOut, MapPin, PackageSearch, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "Tổng quan", icon: Home },
  { href: "/account/profile", label: "Hồ sơ", icon: UserRound },
  { href: "/account/addresses", label: "Địa chỉ giao hàng", icon: MapPin },
  { href: "/account/orders", label: "Đơn hàng của tôi", icon: PackageSearch },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-brand-cream py-20 text-center text-brand-coffee/70">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg bg-white p-4 shadow-sm">
          <Link href="/" className="mb-4 block text-xl font-bold text-brand-coffee">
            PHIN <span className="text-brand-mustard">GO</span>
          </Link>
          <div className="mb-4 rounded-md bg-brand-beige p-3 text-sm text-brand-coffee/75">
            <p className="font-semibold text-brand-coffee">{user.name}</p>
            <p>{user.email}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-coffee/75 hover:bg-brand-beige hover:text-brand-coffee",
                    active && "bg-brand-beige text-brand-coffee"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button className="mt-4 w-full justify-start" variant="ghost" onClick={() => logout().then(() => router.replace("/login"))}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
