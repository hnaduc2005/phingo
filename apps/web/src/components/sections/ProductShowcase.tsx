"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { ThreeDCard } from "@/components/common/ThreeDCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickAddDialog, type QuickAddProduct } from "@/components/cart/QuickAddDialog";
import { imageAssets } from "@/config/images";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { isRemoteImageSrc, safeImageSrc } from "@/lib/image-src";
import { getDisplayStock } from "@/lib/product-stock";

// Use QuickAddProduct which extends ProductLike

const productImages: Record<string, string> = {
  original: imageAssets.productOriginal,
  "bold-robusta": imageAssets.productBoldRobusta,
  "smooth-arabica": imageAssets.productSmoothArabica,
};

function productImage(product: QuickAddProduct) {
  return safeImageSrc(product.imageUrl, productImages[product.slug] || imageAssets.productGroup);
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
}

export function ProductShowcase() {
  const [products, setProducts] = useState<QuickAddProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<QuickAddProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const payload = await apiFetch<ApiResponse<QuickAddProduct[]>>("/api/products");

        if (!cancelled) {
          setProducts(payload.data ?? []);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpenAddDialog(product: QuickAddProduct) {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }

  return (
    <section id="products" className="bg-brand-warm-white py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-brand-coffee">Khám phá hương vị PHIN GO</h2>
          <p className="text-lg text-brand-coffee/70">
            Mỗi dòng sản phẩm đều được chăm chút từ hạt cà phê, quy cách đóng gói đến trải nghiệm pha phin tiện lợi.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center text-brand-coffee/70 shadow-sm">Đang tải sản phẩm...</div>
        ) : null}

        {!isLoading && products.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-brand-coffee/70 shadow-sm">Chưa có sản phẩm đang bán.</div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ThreeDCard key={product.id} className="h-full">
              <div className="glass-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] border-white/40 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-coffee/10">
                <div className="relative mb-8 flex h-64 items-center justify-center p-4">
                  <Image
                    src={productImage(product)}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={isRemoteImageSrc(productImage(product))}
                  />
                </div>

                <div className="relative z-10 flex flex-1 flex-col">
                  <Badge variant="outline" className="mb-3 w-fit border-brand-coffee/10 bg-white/50 backdrop-blur-sm">
                    {product.category?.name ?? "PHIN GO"}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold text-brand-coffee transition-colors group-hover:text-brand-mustard">
                    {product.name}
                  </h3>
                  <p className="mb-6 line-clamp-3 flex-1 text-sm text-brand-coffee/70">
                    {product.shortDescription || product.description || ""}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-brand-coffee/10 pt-6">
                    <div>
                      <div className="text-xl font-bold text-brand-coffee">{formatCurrency(product.price)}</div>
                      <div className="text-xs text-brand-coffee/60">Còn {getDisplayStock(product)} sản phẩm</div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="rounded-full border-brand-coffee/20">
                        <Link href={`/products/${product.slug}`}>Chi tiết</Link>
                      </Button>
                      <Button
                        variant="premium"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleOpenAddDialog(product)}
                        disabled={getDisplayStock(product) <= 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Mua
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
      
      <QuickAddDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </section>
  );
}
