import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

function loadEnvIfNeeded() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), "../../../.env")
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    if (process.env.DATABASE_URL) {
      return;
    }
  }
}

loadEnvIfNeeded();

const prisma = new PrismaClient();

async function syncProductStock() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      variants: {
        select: {
          stock: true
        }
      }
    }
  });
  const updatedProducts = [];

  for (const product of products) {
    if (product.variants.length === 0) {
      continue;
    }

    const variantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

    if (product.stock === variantStock) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: variantStock }
    });

    updatedProducts.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      before: product.stock,
      after: variantStock
    });
  }

  return updatedProducts;
}

async function getCompletedRevenue() {
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true,
      orderCode: true,
      totalAmount: true
    },
    orderBy: { createdAt: "desc" }
  });

  return {
    completedOrderCount: completedOrders.length,
    completedRevenue: completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    completedOrders: completedOrders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      totalAmount: Number(order.totalAmount)
    }))
  };
}

async function main() {
  const [updatedProducts, revenue] = await Promise.all([
    syncProductStock(),
    getCompletedRevenue()
  ]);

  console.info(
    JSON.stringify(
      {
        syncedProductCount: updatedProducts.length,
        updatedProducts,
        revenue
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
