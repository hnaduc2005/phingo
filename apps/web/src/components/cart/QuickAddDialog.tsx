"use client";

import { X, ShoppingCart, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart, type ProductLike } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Button } from "@/components/ui/button";
import { imageAssets } from "@/config/images";

export type QuickAddProduct = ProductLike & {
  shortDescription?: string | null;
  description?: string | null;
  variants?: {
    id: string;
    name: string;
    price: number | string;
    stock: number;
  }[];
  category?: { name: string } | null;
};

type QuickAddDialogProps = {
  product: QuickAddProduct | null;
  isOpen: boolean;
  onClose: () => void;
};

const productImages: Record<string, string> = {
  original: imageAssets.productOriginal,
  "bold-robusta": imageAssets.productBoldRobusta,
  "smooth-arabica": imageAssets.productSmoothArabica,
};

function productImage(product: QuickAddProduct) {
  return product.imageUrl || productImages[product.slug] || imageAssets.productGroup;
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
}

export function QuickAddDialog({ product, isOpen, onClose }: QuickAddDialogProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedVariantId(product.variants?.[0]?.id);
      setMessage("");
      setError("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) {
    return null;
  }

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const stock = selectedVariant?.stock ?? product.stock ?? 0;
  const price = selectedVariant?.price ?? product.price;

  async function handleAdd(action: "add" | "buy") {
    if (!product) return;
    setError("");
    setMessage("");

    if (quantity > stock) {
      setError(`Vượt quá số lượng tồn kho. Chỉ còn ${stock} sản phẩm.`);
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product, quantity, selectedVariantId);
      
      if (action === "buy") {
        router.push("/checkout");
        onClose();
      } else {
        setMessage("Đã thêm vào giỏ hàng.");
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex gap-4 pr-6">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-cream/50 p-2">
            <Image
              src={productImage(product)}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold text-brand-coffee/60 uppercase tracking-wider mb-1">
              {product.category?.name ?? "PHIN GO"}
            </p>
            <h3 className="text-xl font-bold text-brand-coffee line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <p className="mt-2 text-2xl font-bold text-brand-mustard">
              {formatCurrency(price)}
            </p>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-6">
          {product.variants?.length ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-brand-coffee">Quy cách</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedVariantId === variant.id
                        ? "border-brand-mustard bg-brand-mustard/10 text-brand-coffee shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-brand-coffee/30 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                    type="button"
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-coffee">Số lượng</p>
              <p className="text-xs text-brand-coffee/60">Tồn kho: {stock}</p>
            </div>
            <QuantityStepper value={quantity} onChange={setQuantity} max={stock} />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
        ) : null}
        
        {message ? (
          <p className="mt-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{message}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button 
            className="flex-1" 
            variant="outline" 
            size="lg" 
            onClick={() => handleAdd("add")}
            disabled={!stock || isAdding || quantity > stock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </Button>
          <Button 
            className="flex-1" 
            variant="premium" 
            size="lg" 
            onClick={() => handleAdd("buy")}
            disabled={!stock || isAdding || quantity > stock}
          >
            <Zap className="mr-2 h-4 w-4" />
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
