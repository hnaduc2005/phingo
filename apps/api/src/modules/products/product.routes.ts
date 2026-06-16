import type { FastifyInstance } from "fastify";

import { fail, ok } from "../../utils/response";
import { withDisplayStock } from "./product-stock";

export async function productRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const products = await app.prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ categoryId: null }, { category: { isActive: true } }]
      },
      include: {
        category: true,
        variants: true
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(reply, "Products fetched", products.map(withDisplayStock));
  });

  app.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const product = await app.prisma.product.findUnique({
      where: { slug: request.params.slug },
      include: {
        category: true,
        variants: true
      }
    });

    if (!product || product.status !== "ACTIVE" || product.category?.isActive === false) {
      return fail(reply, "Product not found", undefined, 404);
    }

    return ok(reply, "Product fetched", withDisplayStock(product));
  });
}
