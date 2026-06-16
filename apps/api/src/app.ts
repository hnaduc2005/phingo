import Fastify from "fastify";
import { ZodError } from "zod";

import { authPlugin } from "./plugins/auth";
import { corsPlugin } from "./plugins/cors";
import { prismaPlugin } from "./plugins/prisma";
import { accountRoutes } from "./modules/account/account.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { cartRoutes } from "./modules/carts/cart.routes";
import { adminCategoryRoutes } from "./modules/categories/admin-category.routes";
import { categoryRoutes } from "./modules/categories/category.routes";
import { adminContentRoutes } from "./modules/content/admin-content.routes";
import { contentRoutes } from "./modules/content/content.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { adminOrderRoutes } from "./modules/orders/admin-order.routes";
import { adminPaymentRoutes } from "./modules/payments/admin-payment.routes";
import { paymentRoutes } from "./modules/payments/payment.routes";
import { adminProductRoutes } from "./modules/products/admin-product.routes";
import { adminProductVariantRoutes } from "./modules/products/admin-product-variant.routes";
import { productRoutes } from "./modules/products/product.routes";
import { adminPromotionRoutes } from "./modules/promotions/admin-promotion.routes";
import { promotionRoutes } from "./modules/promotions/promotion.routes";
import { adminDashboardRoutes } from "./modules/reports/admin-dashboard.routes";
import { reportRoutes } from "./modules/reports/report.routes";
import { adminStoreRoutes } from "./modules/stores/admin-store.routes";
import { storeRoutes } from "./modules/stores/store.routes";
import { uploadRoutes } from "./modules/uploads/upload.routes";
import { adminCustomerRoutes } from "./modules/users/admin-customer.routes";
import { siteSettingRoutes } from "./modules/site-settings/site-setting.routes";
import { adminSiteSettingRoutes } from "./modules/site-settings/admin-site-setting.routes";
import { contactMessageRoutes } from "./modules/contact-messages/contact-message.routes";
import { adminContactMessageRoutes } from "./modules/contact-messages/admin-contact-message.routes";
import { fail, formatZodError } from "./utils/response";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "test" ? "silent" : "info"
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      if (process.env.NODE_ENV === "development") {
        app.log.warn({ validation: formatZodError(error) }, "Validation failed");
      }

      return fail(reply, "Dữ liệu không hợp lệ", formatZodError(error), 422);
    }

    app.log.error(error);
    return fail(reply, error.message || "Internal server error", undefined, error.statusCode ?? 500);
  });

  await app.register(corsPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  app.get("/api/health", async (_request, reply) => {
    return reply.send({
      success: true,
      message: "PHIN GO API is running",
      timestamp: new Date().toISOString(),
      data: {
        service: "phingo-api"
      }
    });
  });

  app.get("/api", async (_request, reply) => {
    return reply.send({
      success: true,
      message: "PHIN GO public API",
      data: {
        publicPrefix: "/api",
        adminPrefix: "/api/admin"
      }
    });
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(accountRoutes, { prefix: "/api/account" });
  await app.register(productRoutes, { prefix: "/api/products" });
  await app.register(orderRoutes, { prefix: "/api/orders" });
  await app.register(paymentRoutes, { prefix: "/api/payments" });
  await app.register(promotionRoutes, { prefix: "/api/promotions" });
  await app.register(storeRoutes, { prefix: "/api/stores" });
  await app.register(contentRoutes, { prefix: "/api/content" });
  await app.register(categoryRoutes, { prefix: "/api/categories" });
  await app.register(cartRoutes, { prefix: "/api/cart" });
  await app.register(siteSettingRoutes, { prefix: "/api/site-settings" });
  await app.register(contactMessageRoutes, { prefix: "/api/contact-messages" });

  await app.register(adminDashboardRoutes, { prefix: "/api/admin/dashboard" });
  await app.register(adminProductRoutes, { prefix: "/api/admin/products" });
  await app.register(adminProductVariantRoutes, { prefix: "/api/admin" });
  await app.register(adminCategoryRoutes, { prefix: "/api/admin/categories" });
  await app.register(adminOrderRoutes, { prefix: "/api/admin/orders" });
  await app.register(adminCustomerRoutes, { prefix: "/api/admin/customers" });
  await app.register(adminPaymentRoutes, { prefix: "/api/admin/payments" });
  await app.register(adminPromotionRoutes, { prefix: "/api/admin/promotions" });
  await app.register(adminStoreRoutes, { prefix: "/api/admin/stores" });
  await app.register(adminContentRoutes, { prefix: "/api/admin/content" });
  await app.register(reportRoutes, { prefix: "/api/admin/reports" });
  await app.register(uploadRoutes, { prefix: "/api/admin/uploads" });
  await app.register(adminSiteSettingRoutes, { prefix: "/api/admin/site-settings" });
  await app.register(adminContactMessageRoutes, { prefix: "/api/admin/contact-messages" });

  return app;
}
