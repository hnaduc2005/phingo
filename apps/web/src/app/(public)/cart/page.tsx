"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { imageAssets } from "@/config/images";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, subtotal, isLoading, updateItem, removeItem, clearCart } = useCart();
  const [error, setError] = useState("");

  function goCheckout() {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  }

  async function handleUpdateItem(id: string, quantity: number) {
    setError("");

    try {
      await updateItem(id, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật giỏ hàng.");
    }
  }

  if (isLoading) {
    return <div className="min-h-[60vh] bg-brand-cream py-24 text-center text-brand-coffee/70">Đang tải giỏ hàng...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-cream py-24">
        <div className="container mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
            <ShoppingCart className="h-12 w-12" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-brand-coffee">Giỏ hàng trống</h1>
          <p className="mb-8 text-brand-coffee/70">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các hương vị cà phê phin từ PHIN GO.
          </p>
          <Button asChild size="lg" variant="premium" className="w-full">
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream py-16">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-coffee">Giỏ hàng</h1>
              <p className="mt-2 text-sm text-brand-coffee/70">Kiểm tra sản phẩm trước khi thanh toán.</p>
            </div>
            <Button variant="outline" onClick={clearCart}>
              <Trash2 className="h-4 w-4" />
              Xóa giỏ
            </Button>
          </div>

          {error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-lg border border-brand-coffee/10 p-4 md:grid-cols-[96px_1fr_auto]">
                <div className="relative h-24 w-24 rounded-md bg-brand-cream">
                  <Image
                    src={item.imageUrl || imageAssets.productGroup}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </div>
                <div>
                  <Link href={`/products/${item.slug}`} className="text-lg font-semibold text-brand-coffee hover:text-brand-mustard">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-brand-coffee/60">Đơn giá: {formatCurrency(item.price)}</p>
                  <p className="mt-1 text-sm text-brand-coffee/60">Tạm tính: {formatCurrency(item.price * item.quantity)}</p>
                  {item.stock !== undefined ? (
                    <p className="mt-1 text-xs text-brand-coffee/50">Còn {item.stock} sản phẩm trong kho</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <div className="flex items-center rounded-md border border-brand-coffee/15">
                    <button
                      className="flex h-9 w-9 items-center justify-center"
                      onClick={() => handleUpdateItem(item.id, item.quantity - 1)}
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      className="h-9 w-14 border-x border-brand-coffee/15 text-center outline-none"
                      min={1}
                      max={item.stock}
                      type="number"
                      value={item.quantity}
                      onChange={(event) => handleUpdateItem(item.id, Number(event.target.value))}
                    />
                    <button
                      className="flex h-9 w-9 items-center justify-center"
                      onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-coffee">Tóm tắt</h2>
          <div className="mt-6 space-y-3 text-sm text-brand-coffee/70">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold text-brand-coffee">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>{subtotal >= 300000 ? "Miễn phí" : formatCurrency(25000)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" variant="premium" onClick={goCheckout}>
            Đi đến checkout
          </Button>
          {!isAuthenticated ? (
            <p className="mt-3 text-xs text-brand-coffee/60">Bạn cần đăng nhập trước khi đặt hàng.</p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
