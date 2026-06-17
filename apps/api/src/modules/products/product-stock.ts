import type { Prisma, PrismaClient } from "@phingo/database";

type StockClient = PrismaClient | Prisma.TransactionClient;

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

export async function getProductVariantStockSummary(prisma: StockClient, productId: string) {
  const summary = await prisma.productVariant.aggregate({
    where: { productId },
    _count: { _all: true },
    _sum: { stock: true }
  });

  return {
    variantCount: summary._count._all,
    variantStock: summary._sum.stock ?? 0
  };
}

export async function syncProductStockFromVariants(prisma: StockClient, productId: string) {
  const summary = await getProductVariantStockSummary(prisma, productId);

  await prisma.product.update({
    where: { id: productId },
    data: { stock: summary.variantStock }
  });

  return summary;
}

export async function syncProductStockFromVariantsIfAny(prisma: StockClient, productId: string) {
  const summary = await getProductVariantStockSummary(prisma, productId);

  if (summary.variantCount > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: summary.variantStock }
    });
  }

  return summary;
}

export async function adjustProductStockByDelta(prisma: StockClient, productId: string, delta: number) {
  if (delta === 0) {
    return;
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      stock: delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) }
    }
  });
}
