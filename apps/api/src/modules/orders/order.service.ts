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

type CheckoutItem = {
  productId: string;
  variantId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

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

export async function getBankTransferInfo(prisma: PrismaClient) {
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

async function resolveCheckoutItems(prisma: PrismaClient, customerId: string, input: CreateOrderInput) {
  const inputItems = input.items ?? [];

  if (inputItems.length > 0) {
    const productIds = inputItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { variants: true }
    });

    return inputItems.map((item) => {
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

      const availableStock = variant?.stock ?? product.stock;

      if (item.quantity > availableStock) {
        throw new Error(`${product.name} only has ${availableStock} item(s) left`);
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
  }

  const cart = await prisma.cart.findUnique({
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

  return cart.items.map((item) => {
    if (item.product.status !== "ACTIVE") {
      throw new Error(`${item.product.name} is not available`);
    }

    const availableStock = item.variant?.stock ?? item.product.stock;

    if (item.quantity > availableStock) {
      throw new Error(`${item.product.name} only has ${availableStock} item(s) left`);
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
}

async function decrementStock(tx: Prisma.TransactionClient, items: CheckoutItem[]) {
  for (const item of items) {
    if (item.variantId) {
      const updated = await tx.productVariant.updateMany({
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
      });

      if (updated.count !== 1) {
        throw new Error(`${item.productName} does not have enough stock`);
      }
    } else {
      const updated = await tx.product.updateMany({
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

      if (updated.count !== 1) {
        throw new Error(`${item.productName} does not have enough stock`);
      }
    }
  }
}

async function restoreStock(
  tx: Prisma.TransactionClient,
  items: { productId: string | null; variantId: string | null; quantity: number }[]
) {
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    } else if (item.productId) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }
  }
}

export async function createOrder(prisma: PrismaClient, customerId: string, input: CreateOrderInput) {
  const customer = await prisma.user.findUnique({
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

  const orderItems = await resolveCheckoutItems(prisma, customerId, input);
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const promotion = input.promotionCode
    ? await prisma.promotion.findUnique({
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
    input.paymentMethod === "BANK_TRANSFER" ? await getBankTransferInfo(prisma) : undefined;

  return prisma.$transaction(async (tx) => {
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
        orderCode: createOrderCode(),
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

    await decrementStock(tx, orderItems);
    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId: customerId
        }
      }
    });

    return order;
  });
}

export async function updateOrderStatus(prisma: PrismaClient, orderId: string, status: OrderStatus) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true
    }
  });

  if (!existing) {
    throw new Error("Order not found");
  }

  if (existing.status === "CANCELLED" && status !== "CANCELLED") {
    throw new Error("Cancelled orders cannot be reopened");
  }

  return prisma.$transaction(async (tx) => {
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      await restoreStock(tx, existing.items);
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "CANCELLED"
          ? {
              paymentStatus: existing.paymentStatus === "PAID" ? "REFUNDED" : "FAILED",
              payment: existing.payment
                ? {
                    update: {
                      status: existing.paymentStatus === "PAID" ? "REFUNDED" : "FAILED"
                    }
                  }
                : undefined
            }
          : {})
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
