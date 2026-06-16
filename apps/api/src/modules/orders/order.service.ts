import type { CreateOrderInput, OrderStatus, PaymentMethod } from "@phingo/shared";
import type { Prisma, PrismaClient } from "@phingo/database";

const BANK_SETTING_KEYS = ["bankName", "bankAccountNumber", "bankAccountHolder", "bankQrImageUrl", "bankTransferNoteTemplate"] as const;

const DEFAULT_BANK_TRANSFER_INFO = {
  bankName: "",
  bankAccountNumber: "",
  bankAccountHolder: "",
  qrImageUrl: "",
  transferContentTemplate: "PHINGO {orderCode}"
};

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

type StockLogger = {
  info: (bindings: Record<string, unknown>, message?: string) => void;
  warn: (bindings: Record<string, unknown>, message?: string) => void;
};

type CheckoutItem = {
  productId: string;
  variantId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

type StockAdjustment = {
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
};

export type InsufficientStockItem = {
  productId: string;
  variantId?: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
};

export class InsufficientStockError extends Error {
  code = "INSUFFICIENT_STOCK" as const;
  items: InsufficientStockItem[];

  constructor(items: InsufficientStockItem[]) {
    super("Một số sản phẩm không đủ tồn kho");
    this.name = "InsufficientStockError";
    this.items = items;
  }
}

function createOrderCode() {
  return `PG${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

function getInitialPaymentStatus(method: PaymentMethod) {
  if (method === "BANK_TRANSFER") {
    return "PENDING" as const;
  }

  if (method === "COD") {
    return "UNPAID" as const;
  }

  return "PENDING" as const;
}

export async function getBankTransferInfo(prisma: PrismaExecutor) {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [...BANK_SETTING_KEYS]
      }
    }
  });
  const settingsMap = settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return {
    bankName: settingsMap.bankName ?? DEFAULT_BANK_TRANSFER_INFO.bankName,
    bankAccountNumber: settingsMap.bankAccountNumber ?? DEFAULT_BANK_TRANSFER_INFO.bankAccountNumber,
    bankAccountHolder: settingsMap.bankAccountHolder ?? DEFAULT_BANK_TRANSFER_INFO.bankAccountHolder,
    qrImageUrl: settingsMap.bankQrImageUrl ?? DEFAULT_BANK_TRANSFER_INFO.qrImageUrl,
    transferContentTemplate: settingsMap.bankTransferNoteTemplate ?? DEFAULT_BANK_TRANSFER_INFO.transferContentTemplate
  };
}

function formatAddress(address: {
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
}) {
  return `${address.receiverName} - ${address.receiverPhone}, ${address.addressLine}, ${address.ward}, ${address.district}, ${address.city}`;
}

function groupStockAdjustments(items: CheckoutItem[] | { productId: string | null; variantId: string | null; productName?: string; quantity: number }[]) {
  const grouped = new Map<string, StockAdjustment>();

  for (const item of items) {
    if (!item.productId && !item.variantId) {
      continue;
    }

    const key = item.variantId ? `variant:${item.variantId}` : `product:${item.productId}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    grouped.set(key, {
      productId: item.productId ?? "",
      variantId: item.variantId ?? undefined,
      productName: item.productName ?? "Sản phẩm",
      quantity: item.quantity
    });
  }

  return [...grouped.values()];
}

async function getAvailableStock(tx: Prisma.TransactionClient, item: StockAdjustment) {
  if (item.variantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
      select: { stock: true }
    });

    return variant?.stock ?? 0;
  }

  const product = await tx.product.findUnique({
    where: { id: item.productId },
    select: { stock: true }
  });

  return product?.stock ?? 0;
}

async function assertStockAvailable(tx: Prisma.TransactionClient, items: CheckoutItem[]) {
  const insufficient: InsufficientStockItem[] = [];

  for (const item of groupStockAdjustments(items)) {
    const availableStock = await getAvailableStock(tx, item);

    if (item.quantity > availableStock) {
      insufficient.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        requestedQuantity: item.quantity,
        availableStock
      });
    }
  }

  if (insufficient.length > 0) {
    throw new InsufficientStockError(insufficient);
  }
}

async function resolveCheckoutItems(tx: Prisma.TransactionClient, customerId: string, input: CreateOrderInput) {
  const inputItems = input.items ?? [];

  if (inputItems.length > 0) {
    const productIds = [...new Set(inputItems.map((item) => item.productId))];
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { variants: true }
    });

    const orderItems = inputItems.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} is not available`);
      }

      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : undefined;

      if (item.variantId && !variant) {
        throw new Error(`Variant ${item.variantId} is not available`);
      }

      const unitPrice = Number(variant?.price ?? product.price);

      return {
        productId: product.id,
        variantId: variant?.id,
        productName: variant ? `${product.name} - ${variant.name}` : product.name,
        unitPrice,
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity
      };
    });

    await assertStockAvailable(tx, orderItems);

    return orderItems;
  }

  const cart = await tx.cart.findUnique({
    where: { userId: customerId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderItems = cart.items.map((item) => {
    if (item.product.status !== "ACTIVE") {
      throw new Error(`${item.product.name} is not available`);
    }

    const unitPrice = Number(item.variant?.price ?? item.product.price);

    return {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      productName: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
      unitPrice,
      quantity: item.quantity,
      totalPrice: unitPrice * item.quantity
    };
  });

  await assertStockAvailable(tx, orderItems);

  return orderItems;
}

async function decrementStock(
  tx: Prisma.TransactionClient,
  items: CheckoutItem[],
  logger?: StockLogger,
  meta?: { orderCode: string; userId: string }
) {
  const insufficient: InsufficientStockItem[] = [];

  for (const item of groupStockAdjustments(items)) {
    const updated = item.variantId
      ? await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      : await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

    logger?.info(
      {
        orderCode: meta?.orderCode,
        userId: meta?.userId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        decrementCount: updated.count
      },
      "Stock decrement result"
    );

    if (updated.count !== 1) {
      insufficient.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        requestedQuantity: item.quantity,
        availableStock: await getAvailableStock(tx, item)
      });
    }
  }

  if (insufficient.length > 0) {
    throw new InsufficientStockError(insufficient);
  }
}

async function restoreStock(
  tx: Prisma.TransactionClient,
  items: { productId: string | null; variantId: string | null; productName?: string; quantity: number }[],
  logger?: StockLogger,
  meta?: { orderCode: string; userId: string }
) {
  for (const item of groupStockAdjustments(items)) {
    const updated = item.variantId
      ? await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      : await tx.product.updateMany({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });

    logger?.info(
      {
        orderCode: meta?.orderCode,
        userId: meta?.userId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        restoreCount: updated.count
      },
      "Stock restore result"
    );

    if (updated.count !== 1) {
      logger?.warn(
        {
          orderCode: meta?.orderCode,
          userId: meta?.userId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        },
        "Stock restore skipped because stock owner was not found"
      );
    }
  }
}

export async function createOrder(
  prisma: PrismaClient,
  customerId: string,
  input: CreateOrderInput,
  logger?: StockLogger
) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({
      where: { id: customerId },
      include: {
        addresses: true
      }
    });

    if (!customer || customer.status !== "ACTIVE") {
      throw new Error("Customer account is not active");
    }

    const selectedAddress = input.addressId
      ? customer.addresses.find((address) => address.id === input.addressId)
      : undefined;

    const shippingAddress = selectedAddress
      ? formatAddress(selectedAddress)
      : input.shippingAddress;

    if (!shippingAddress) {
      throw new Error("Shipping address is required");
    }

    const orderItems = await resolveCheckoutItems(tx, customerId, input);
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const promotion = input.promotionCode
      ? await tx.promotion.findUnique({
          where: { code: input.promotionCode.toUpperCase() }
        })
      : null;
    const now = new Date();
    const canApplyPromotion =
      promotion?.isActive &&
      (!promotion.startDate || promotion.startDate <= now) &&
      (!promotion.endDate || promotion.endDate >= now) &&
      (!promotion.usageLimit || promotion.usedCount < promotion.usageLimit);
    const discountAmount =
      canApplyPromotion && promotion
        ? promotion.discountType === "PERCENT"
          ? Math.min(subtotal, subtotal * (Number(promotion.discountValue) / 100))
          : Math.min(subtotal, Number(promotion.discountValue))
        : 0;
    const shippingFee = subtotal >= 300000 ? 0 : 25000;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
    const paymentStatus = getInitialPaymentStatus(input.paymentMethod);
    const bankTransferInfo =
      input.paymentMethod === "BANK_TRANSFER" ? await getBankTransferInfo(tx) : undefined;
    const orderCode = createOrderCode();

    if (canApplyPromotion && promotion) {
      await tx.promotion.update({
        where: { id: promotion.id },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });
    }

    const order = await tx.order.create({
      data: {
        orderCode,
        customerId: customer.id,
        customerName: input.customerName ?? customer.name,
        customerEmail: customer.email,
        customerPhone: input.customerPhone ?? customer.phone ?? selectedAddress?.receiverPhone ?? "",
        shippingAddress,
        note: input.note,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus,
        promotionCode: canApplyPromotion ? promotion?.code : undefined,
        items: {
          create: orderItems
        },
        payment: {
          create: {
            method: input.paymentMethod,
            status: paymentStatus,
            amount: totalAmount,
            transactionCode: input.transactionCode,
            transferImageUrl: input.transferImageUrl,
            bankName: bankTransferInfo?.bankName,
            bankAccountNumber: bankTransferInfo?.bankAccountNumber,
            bankAccountHolder: bankTransferInfo?.bankAccountHolder
          }
        }
      },
      include: {
        items: true,
        payment: true
      }
    });

    await decrementStock(tx, orderItems, logger, { orderCode, userId: customer.id });
    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId: customerId
        }
      }
    });

    logger?.info(
      {
        orderCode,
        userId: customer.id,
        items: orderItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      },
      "Order created and stock decremented"
    );

    return order;
  });
}

export async function updateOrderStatus(
  prisma: PrismaClient,
  orderId: string,
  status: OrderStatus,
  logger?: StockLogger
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true
      }
    });

    if (!existing) {
      throw new Error("Order not found");
    }

    if (existing.status === "CANCELLED") {
      if (status === "CANCELLED") {
        return existing;
      }

      throw new Error("Cancelled orders cannot be reopened");
    }

    if (status === "CANCELLED") {
      if (existing.status === "COMPLETED") {
        throw new Error("Completed orders cannot be cancelled by this endpoint");
      }

      const cancelled = await tx.order.updateMany({
        where: {
          id: orderId,
          status: {
            not: "CANCELLED"
          }
        },
        data: {
          status,
          paymentStatus: existing.paymentStatus === "PAID" ? "REFUNDED" : "FAILED"
        }
      });

      if (cancelled.count !== 1) {
        const current = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
            payment: true
          }
        });

        if (current) {
          return current;
        }

        throw new Error("Order not found");
      }

      await restoreStock(tx, existing.items, logger, {
        orderCode: existing.orderCode,
        userId: existing.customerId
      });

      if (existing.payment) {
        await tx.payment.update({
          where: { id: existing.payment.id },
          data: {
            status: existing.paymentStatus === "PAID" ? "REFUNDED" : "FAILED"
          }
        });
      }

      const updated = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payment: true,
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true
            }
          }
        }
      });

      if (!updated) {
        throw new Error("Order not found");
      }

      return updated;
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status
      },
      include: {
        items: true,
        payment: true,
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });
  });
}

export async function getPaymentMethodMeta(prisma: PrismaClient) {
  const bankTransfer = await getBankTransferInfo(prisma);

  return [
    {
      method: "COD",
      name: "Thanh toán khi nhận hàng",
      enabled: true
    },
    {
      method: "BANK_TRANSFER",
      name: "Chuyển khoản ngân hàng",
      enabled: true,
      bankTransfer
    },
    {
      method: "MOMO",
      name: "Momo",
      enabled: false
    },
    {
      method: "VNPAY",
      name: "VNPAY",
      enabled: false
    },
    {
      method: "ZALOPAY",
      name: "ZaloPay",
      enabled: false
    },
    {
      method: "CREDIT_CARD",
      name: "Thẻ tín dụng",
      enabled: false
    }
  ];
}
