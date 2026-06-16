type StockVariant = {
  stock: number;
};

type StockProduct = {
  stock: number;
  variants?: StockVariant[];
};

export function getVariantStock(product: StockProduct) {
  return product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;
}

export function withDisplayStock<T extends StockProduct>(product: T) {
  const variantStock = getVariantStock(product);
  const hasVariants = Boolean(product.variants?.length);

  return {
    ...product,
    variantStock,
    displayStock: hasVariants ? variantStock : product.stock,
    stockMismatch: hasVariants ? product.stock !== variantStock : false
  };
}
