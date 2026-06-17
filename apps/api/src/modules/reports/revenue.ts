import type { Prisma, PrismaClient } from "@phingo/database";

type RevenueClient = PrismaClient | Prisma.TransactionClient;

export const completedRevenueWhere = {
  status: "COMPLETED"
} satisfies Prisma.OrderWhereInput;

export async function getCompletedRevenueSummary(prisma: RevenueClient) {
  const [revenue, completedOrderCount] = await Promise.all([
    prisma.order.aggregate({
      where: completedRevenueWhere,
      _sum: { totalAmount: true }
    }),
    prisma.order.count({
      where: completedRevenueWhere
    })
  ]);

  return {
    totalRevenue: revenue._sum.totalAmount ?? 0,
    completedOrderCount
  };
}

export async function getCompletedProductSales(prisma: RevenueClient, options?: { take?: number }) {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { not: null },
      order: completedRevenueWhere
    },
    _sum: {
      quantity: true,
      totalPrice: true
    },
    orderBy: {
      _sum: {
        quantity: "desc"
      }
    },
    ...(options?.take ? { take: options.take } : {})
  });

  const productIds = rows.flatMap((row) => (row.productId ? [row.productId] : []));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true
    }
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return rows.flatMap((row) => {
    if (!row.productId) {
      return [];
    }

    const product = productById.get(row.productId);

    return [
      {
        productId: row.productId,
        id: row.productId,
        productName: product?.name ?? "Sản phẩm",
        name: product?.name ?? "Sản phẩm",
        slug: product?.slug ?? "",
        imageUrl: product?.imageUrl ?? null,
        totalQuantitySold: row._sum.quantity ?? 0,
        totalRevenue: Number(row._sum.totalPrice ?? 0)
      }
    ];
  });
}
