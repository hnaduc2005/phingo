"use client";

import { LogIn, ShieldCheck, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";

export function HeaderAuthActions() {
  const { user } = useAuth();
  const { totalQuantity } = useCart();

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="icon" className="relative text-brand-coffee hover:bg-brand-coffee/10">
        <Link href="/cart" aria-label="Giỏ hàng">
          <ShoppingCart className="h-5 w-5" />
          {totalQuantity > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-mustard px-1 text-[11px] font-bold text-white">
              {totalQuantity}
            </span>
          ) : null}
        </Link>
      </Button>

      {user?.role === "ADMIN" ? (
        <Button asChild variant="ghost" size="icon" className="text-brand-coffee hover:bg-brand-coffee/10">
          <Link href="/admin" aria-label="Trang admin">
            <ShieldCheck className="h-5 w-5" />
          </Link>
        </Button>
      ) : null}

      <Button asChild variant="ghost" size="icon" className="text-brand-coffee hover:bg-brand-coffee/10">
        <Link href={user ? "/account" : "/login"} aria-label={user ? "Tài khoản" : "Đăng nhập"}>
          {user ? <UserRound className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
        </Link>
      </Button>

      <Button asChild variant="premium" className="hidden sm:inline-flex">
        <Link href="/products">Mua ngay</Link>
      </Button>
    </div>
  );
}
