import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalId, requiredTrimmedString } from "@phingo/shared";

import { requireRole } from "../../middlewares/require-role";
import { fail, ok } from "../../utils/response";

const addCartItemSchema = z.object({
  productId: requiredTrimmedString(1),
  variantId: optionalId,
  quantity: z.coerce.number().int().positive().default(1)
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive()
});

const guestCartItemSchema = z.object({
  productId: requiredTrimmedString(1),
  variantId: optionalId,
  quantity: z.coerce.number().int().positive()
});

const mergeGuestCartSchema = z.object({
  items: z.array(guestCartItemSchema).default([])
});

async function findOrCreateCart(app: FastifyInstance, userId: string) {
  const existing = await app.prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });

  if (existing) {
    return existing;
  }

  return app.prisma.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });
}

async function addItemToCart(
  app: FastifyInstance,
  cartId: string,
  input: { productId: string; variantId?: string; quantity: number }
) {
  const product = await app.prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: true }
  });

  if (!product || product.status !== "ACTIVE") {
    throw new Error("Product not found");
  }

  const variant = input.variantId
    ? product.variants.find((candidate) => candidate.id === input.variantId)
    : undefined;

  if (input.variantId && !variant) {
    throw new Error("Variant not found");
  }

  const availableStock = variant?.stock ?? product.stock;
  const existingItem = await app.prisma.cartItem.findFirst({
    where: {
      cartId,
      productId: input.productId,
      variantId: input.variantId ?? null
    }
  });
  const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

  if (nextQuantity > availableStock) {
    throw new Error(`Only ${availableStock} item(s) left in stock`);
  }

  const price = variant?.price ?? product.price;

  return existingItem
    ? app.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: nextQuantity,
          price
        },
        include: {
          product: true,
          variant: true
        }
      })
    : app.prisma.cartItem.create({
        data: {
          cartId,
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
          price
        },
        include: {
          product: true,
          variant: true
        }
      });
}

export async function cartRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireRole(["CUSTOMER", "ADMIN"]));

  app.get("/", async (request, reply) => {
    const cart = await findOrCreateCart(app, request.user.sub);

    return ok(reply, "Cart fetched", cart);
  });

  app.post("/items", async (request, reply) => {
    const body = addCartItemSchema.parse(request.body);
    const cart = await findOrCreateCart(app, request.user.sub);

    try {
      const item = await addItemToCart(app, cart.id, body);

      return ok(reply, "Cart item added", item, 201);
    } catch (error) {
      return fail(reply, error instanceof Error ? error.message : "Cannot add cart item", undefined, 400);
    }
  });

  app.patch<{ Params: { id: string } }>("/items/:id", async (request, reply) => {
    const body = updateCartItemSchema.parse(request.body);
    const item = await app.prisma.cartItem.findFirst({
      where: {
        id: request.params.id,
        cart: {
          userId: request.user.sub
        }
      }
    });

    if (!item) {
      return fail(reply, "Cart item not found", undefined, 404);
    }

    const stockOwner = item.variantId
      ? await app.prisma.productVariant.findUnique({ where: { id: item.variantId } })
      : await app.prisma.product.findUnique({ where: { id: item.productId } });
    const availableStock = stockOwner?.stock ?? 0;

    if (body.quantity > availableStock) {
      return fail(reply, `Only ${availableStock} item(s) left in stock`, { availableStock }, 400);
    }

    const updated = await app.prisma.cartItem.update({
      where: { id: request.params.id },
      data: { quantity: body.quantity },
      include: {
        product: true,
        variant: true
      }
    });

    return ok(reply, "Cart item updated", updated);
  });

  app.post("/merge-guest-cart", async (request, reply) => {
    const body = mergeGuestCartSchema.parse(request.body);
    const cart = await findOrCreateCart(app, request.user.sub);
    const merged = [];
    const errors = [];

    for (const item of body.items) {
      try {
        merged.push(await addItemToCart(app, cart.id, item));
      } catch (error) {
        errors.push({
          item,
          message: error instanceof Error ? error.message : "Cannot merge item"
        });
      }
    }

    const updatedCart = await findOrCreateCart(app, request.user.sub);

    return ok(reply, "Guest cart merged", {
      cart: updatedCart,
      mergedCount: merged.length,
      errors
    });
  });

  app.delete<{ Params: { id: string } }>("/items/:id", async (request, reply) => {
    const item = await app.prisma.cartItem.findFirst({
      where: {
        id: request.params.id,
        cart: {
          userId: request.user.sub
        }
      }
    });

    if (!item) {
      return fail(reply, "Cart item not found", undefined, 404);
    }

    await app.prisma.cartItem.delete({
      where: { id: request.params.id }
    });

    return ok(reply, "Cart item removed");
  });

  app.delete("/clear", async (request, reply) => {
    const cart = await findOrCreateCart(app, request.user.sub);

    await app.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return ok(reply, "Cart cleared");
  });
}
