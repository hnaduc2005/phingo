"use client";

import {
  BarChart3,
  Boxes,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { apiFetch, type ApiResponse } from "@/lib/api";
import { clearAuthSession, getAccessToken, saveAuthUser, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Boxes },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/payments", label: "Thanh toán", icon: WalletCards },
  { href: "/admin/promotions", label: "Mã giảm giá", icon: Percent },
  { href: "/admin/stores", label: "Điểm bán", icon: MapPin },
  { href: "/admin/content", label: "Nội dung", icon: FileText },
  { href: "/admin/contact-messages", label: "Tin nhắn", icon: FileText },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

function loginRedirect(pathname: string) {
  return `/login?redirect=${encodeURIComponent(pathname || "/admin")}`;
}

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | undefined>();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      const token = getAccessToken();

      if (!token) {
        router.replace(loginRedirect(pathname));
        return;
      }

      try {
        const payload = await apiFetch<ApiResponse<AuthUser>>("/api/auth/me");

        if (cancelled) {
          return;
        }

        if (!payload.data) {
          throw new Error(payload.message || "Không tìm thấy tài khoản.");
        }

        saveAuthUser(payload.data);

        if (payload.data.role !== "ADMIN") {
          router.replace("/account");
          return;
        }

        setUser(payload.data);
        setIsChecking(false);
      } catch {
        clearAuthSession();
        router.replace(loginRedirect(pathname));
      }
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-lg border border-gray-100 bg-white px-6 py-5 text-sm font-medium text-gray-700 shadow-sm">
          Đang kiểm tra quyền quản trị...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-72 flex-col bg-brand-coffee text-white">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            PHIN <span className="text-brand-mustard">ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl font-medium transition-all overflow-hidden",
                  isActive 
                    ? "bg-brand-mustard/15 text-brand-mustard shadow-sm"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-mustard" />
                )}
                <Icon className={cn("h-5 w-5 transition-all", isActive ? "text-brand-mustard scale-110" : "text-white/50 group-hover:scale-110 group-hover:text-white/80")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-4 py-2 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Home className="h-5 w-5" />
            Website
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h2 className="text-lg font-semibold text-gray-800">Quản trị PHIN GO</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{user?.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mustard text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
