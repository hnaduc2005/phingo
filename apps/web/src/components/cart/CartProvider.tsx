"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch, type ApiResponse } from "@/lib/api";

export type ProductLike = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  imageUrl?: string | null;
  stock?: number;
};

export type CartLine = {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  stock?: number;
};

type CartApiItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: string | number;
  product: ProductLike;
  variant?: {
    id: string;
    name: string;
    price: string | number;
    stock: number;
  } | null;
};

type CartApi = {
  items: CartApiItem[];
};

type CartContextValue = {
  items: CartLine[];
  totalQuantity: number;
  subtotal: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (product: ProductLike, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
};

const GUEST_CART_KEY = "phingoGuestCart";
const CartContext = createContext<CartContextValue | undefined>(undefined);

function toNumber(value: number | string | undefined | null) {
  return Number(value ?? 0);
}

function normalizeApiItem(item: CartApiItem): CartLine {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
    slug: item.product.slug,
    imageUrl: item.product.imageUrl,
    quantity: item.quantity,
    price: toNumber(item.price),
    stock: item.variant?.stock ?? item.product.stock,
  };
}

function readGuestCart(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) || "[]") as CartLine[];
  } catch {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
}

function writeGuestCart(items: CartLine[]) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("phingo-cart-change"));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setItems(readGuestCart());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const payload = await apiFetch<ApiResponse<CartApi>>("/api/cart");
      setItems((payload.data?.items ?? []).map(normalizeApiItem));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, user]);

  const mergeGuestCart = useCallback(async () => {
    const guestItems = readGuestCart();

    if (!user || guestItems.length === 0) {
      return;
    }

    await apiFetch<ApiResponse>("/api/cart/merge-guest-cart", {
      method: "POST",
      body: JSON.stringify({
        items: guestItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
        })),
      }),
    });
    writeGuestCart([]);
    await refreshCart();
  }, [refreshCart, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (user) {
        mergeGuestCart().catch(() => refreshCart());
      } else {
        refreshCart();
      }
    }, 0);

    function syncCart() {
      if (!user) {
        setItems(readGuestCart());
      }
    }

    window.addEventListener("storage", syncCart);
    window.addEventListener("phingo-cart-change", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("phingo-cart-change", syncCart);
      window.clearTimeout(timer);
    };
  }, [mergeGuestCart, refreshCart, user]);

  async function addItem(product: ProductLike, quantity = 1, variantId?: string) {
    if (quantity <= 0) {
      throw new Error("Số lượng phải lớn hơn 0.");
    }

    if (user) {
      await apiFetch<ApiResponse>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, variantId, quantity }),
      });
      await refreshCart();
      return;
    }

    const current = readGuestCart();
    const key = `${product.id}:${variantId ?? ""}`;
    const existing = current.find((item) => `${item.productId}:${item.variantId ?? ""}` === key);
    const next = existing
      ? current.map((item) =>
          `${item.productId}:${item.variantId ?? ""}` === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [
          ...current,
          {
            id: key,
            productId: product.id,
            variantId,
            name: product.name,
            slug: product.slug,
            imageUrl: product.imageUrl,
            quantity,
            price: toNumber(product.price),
            stock: product.stock,
          },
        ];

    writeGuestCart(next);
    setItems(next);
  }

  async function updateItem(id: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    if (user) {
      await apiFetch<ApiResponse>(`/api/cart/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await refreshCart();
      return;
    }

    const next = readGuestCart().map((item) => (item.id === id ? { ...item, quantity } : item));
    writeGuestCart(next);
    setItems(next);
  }

  async function removeItem(id: string) {
    if (user) {
      await apiFetch<ApiResponse>(`/api/cart/items/${id}`, { method: "DELETE" });
      await refreshCart();
      return;
    }

    const next = readGuestCart().filter((item) => item.id !== id);
    writeGuestCart(next);
    setItems(next);
  }

  async function clearCart() {
    if (user) {
      await apiFetch<ApiResponse>("/api/cart/clear", { method: "DELETE" });
      await refreshCart();
      return;
    }

    writeGuestCart([]);
    setItems([]);
  }

  const value: CartContextValue = {
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    isLoading,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    mergeGuestCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
