"use client";

import { CheckCircle2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GuideSection } from "@/components/sections/GuideSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { useCart, type ProductLike } from "@/components/cart/CartProvider";
import { imageAssets } from "@/config/images";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { isRemoteImageSrc, safeImageSrc } from "@/lib/image-src";
import { getSelectedStock } from "@/lib/product-stock";

type Product = ProductLike & {
  description?: string | null;
  shortDescription?: string | null;
  status: string;
  variants?: {
    id: string;
    name: string;
    price: number | string;
    stock: number;
  }[];
  category?: {
    name: string;
  } | null;
};

const productImages: Record<string, string> = {
  original: imageAssets.productOriginal,
  "bold-robusta": imageAssets.productBoldRobusta,
  "smooth-arabica": imageAssets.productSmoothArabica,
};

function productImage(product: Product) {
  return safeImageSrc(product.imageUrl, productImages[product.slug] || imageAssets.productGroup);
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const payload = await apiFetch<ApiResponse<Product>>(`/api/products/${params.slug}`);

        if (!cancelled) {
          setProduct(payload.data);
          setSelectedVariantId(payload.data?.variants?.[0]?.id);
        }
      } catch {
        router.replace("/products");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.slug, router]);

  async function handleAdd(action: "add" | "buy") {
    if (!product) {
      return;
    }
    
    const stock = getSelectedStock(product, selectedVariantId);
    if (quantity > stock) {
      setError(`Vượt quá số lượng tồn kho. Chỉ còn ${stock} sản phẩm.`);
      return;
    }

    setIsAdding(true);
    setError("");
    setMessage("");

    try {
      await addItem(product, quantity, selectedVariantId);
      
      if (action === "buy") {
        router.push("/checkout");
      } else {
        setMessage(`Đã thêm ${quantity} ${product.name} vào giỏ hàng.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return <div className="bg-brand-cream py-24 text-center text-brand-coffee/70">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return null;
  }

  const selectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId);
  const displayPrice = selectedVariant?.price ?? product.price;
  const stock = getSelectedStock(product, selectedVariantId);

  return (
    <div className="bg-brand-cream">
      <section className="py-12 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[3rem] border border-brand-coffee/5 bg-white p-8 shadow-xl lg:p-16">
            <div className="relative z-10 grid items-center gap-16 lg:grid-cols-2">
              <div className="relative flex h-[400px] items-center justify-center rounded-[2rem] bg-brand-cream/50 p-8 lg:h-[560px]">
                <Image
                  src={productImage(product)}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized={isRemoteImageSrc(productImage(product))}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <Badge variant="outline" className="mb-4 border-brand-coffee/20 text-brand-coffee">
                    {product.category?.name ?? "PHIN GO"}
                  </Badge>
                  <h1 className="mb-4 text-4xl font-bold text-brand-coffee lg:text-5xl">{product.name}</h1>
                  <p className="text-xl leading-relaxed text-brand-coffee/80">
                    {product.description || product.shortDescription}
                  </p>
                </div>

                <div className="space-y-4 border-y border-brand-coffee/10 py-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-green" />
                    <span className="font-medium text-brand-coffee">Tồn kho: {stock}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-gold" />
                    <span className="text-brand-coffee/80">Phù hợp uống nóng, uống đá và mang theo khi đi làm.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-gold" />
                    <span className="text-brand-coffee/80">Thiết kế phin giấy tiện lợi, giữ tinh thần cà phê Việt.</span>
                  </div>
                </div>

                {product.variants?.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-brand-coffee">Quy cách</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          className={`rounded-md border px-3 py-2 text-sm ${
                            selectedVariantId === variant.id
                              ? "border-brand-mustard bg-brand-beige text-brand-coffee"
                              : "border-brand-coffee/15 text-brand-coffee/70"
                          }`}
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            setQuantity((current) => Math.min(current, Math.max(variant.stock, 1)));
                          }}
                          type="button"
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="mb-1 text-sm text-brand-coffee/60">Giá bán</p>
                    <p className="text-4xl font-bold text-brand-coffee">{formatCurrency(displayPrice)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-brand-coffee/60">Số lượng</p>
                    <QuantityStepper value={quantity} onChange={setQuantity} max={stock} />
                  </div>
                </div>

                {error ? <p className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{error}</p> : null}
                {message ? <p className="rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">{message}</p> : null}

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 flex-1 text-lg border-brand-coffee/20" 
                    onClick={() => handleAdd("add")} 
                    disabled={!stock || isAdding || quantity > stock}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Thêm vào giỏ
                  </Button>
                  <Button 
                    size="lg" 
                    variant="premium" 
                    className="h-14 flex-1 text-lg" 
                    onClick={() => handleAdd("buy")} 
                    disabled={!stock || isAdding || quantity > stock}
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GuideSection />
    </div>
  );
}
