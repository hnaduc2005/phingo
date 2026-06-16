export type ProductStockVariant = {
  id?: string;
  stock?: number | string | null;
};

export type ProductStockSource = {
  stock?: number | string | null;
  displayStock?: number | string | null;
  variants?: ProductStockVariant[] | null;
};

function toStockNumber(value: number | string | null | undefined) {
  const stock = Number(value ?? 0);
  return Number.isFinite(stock) ? stock : 0;
}

export function getVariantStock(product: ProductStockSource) {
  return product.variants?.reduce((sum, variant) => sum + toStockNumber(variant.stock), 0) ?? 0;
}

export function getDisplayStock(product: ProductStockSource) {
  if (product.displayStock !== undefined && product.displayStock !== null) {
    return toStockNumber(product.displayStock);
  }

  if (product.variants?.length) {
    return getVariantStock(product);
  }

  return toStockNumber(product.stock);
}

export function getSelectedStock(product: ProductStockSource, variantId?: string) {
  const variant = variantId ? product.variants?.find((item) => item.id === variantId) : undefined;
  return variant ? toStockNumber(variant.stock) : getDisplayStock(product);
}
