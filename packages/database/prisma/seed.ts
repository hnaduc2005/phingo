import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Phingo@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@phingo.vn" },
    update: {
      name: "PHIN GO Admin",
      role: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      email: "admin@phingo.vn",
      passwordHash,
      name: "PHIN GO Admin",
      phone: "0900000001",
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@phingo.vn" },
    update: {
      name: "Khách hàng PHIN GO",
      role: "CUSTOMER",
      status: "ACTIVE"
    },
    create: {
      email: "customer@phingo.vn",
      passwordHash,
      name: "Khách hàng PHIN GO",
      phone: "0900000002",
      role: "CUSTOMER",
      status: "ACTIVE"
    }
  });

  await prisma.customerAddress.upsert({
    where: { id: "seed-address-customer" },
    update: {
      userId: customer.id,
      receiverName: "Khách hàng PHIN GO",
      receiverPhone: "0900000002",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Bến Nghé",
      addressLine: "12 Nguyễn Huệ",
      isDefault: true
    },
    create: {
      id: "seed-address-customer",
      userId: customer.id,
      receiverName: "Khách hàng PHIN GO",
      receiverPhone: "0900000002",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Bến Nghé",
      addressLine: "12 Nguyễn Huệ",
      isDefault: true
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "ca-phe" },
    update: {
      name: "Cà phê",
      isActive: true
    },
    create: {
      name: "Cà phê",
      slug: "ca-phe",
      description: "Dòng sản phẩm cà phê PHIN GO.",
      isActive: true
    }
  });

  const products = [
    {
      name: "Original",
      slug: "original",
      price: 75000,
      sku: "PHINGO-ORIGINAL",
      shortDescription: "Vị cà phê cân bằng, dễ uống mỗi ngày."
    },
    {
      name: "Bold Robusta",
      slug: "bold-robusta",
      price: 90000,
      sku: "PHINGO-BOLD-ROBUSTA",
      shortDescription: "Đậm vị Robusta, hậu vị mạnh."
    },
    {
      name: "Smooth Arabica",
      slug: "smooth-arabica",
      price: 100000,
      sku: "PHINGO-SMOOTH-ARABICA",
      shortDescription: "Hương Arabica mềm mại, thanh sáng."
    }
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        price: item.price,
        sku: item.sku,
        shortDescription: item.shortDescription,
        status: "ACTIVE",
        categoryId: category.id
      },
      create: {
        name: item.name,
        slug: item.slug,
        price: item.price,
        sku: item.sku,
        shortDescription: item.shortDescription,
        description: `${item.name} của PHIN GO, phù hợp mua online và pha nhanh tại nhà.`,
        status: "ACTIVE",
        categoryId: category.id,
        stock: 100
      }
    });

    await prisma.productVariant.upsert({
      where: { sku: `${item.sku}-250G` },
      update: {
        name: "Gói 250g",
        price: item.price,
        description: "Quy cách gói 250g."
      },
      create: {
        productId: product.id,
        name: "Gói 250g",
        sku: `${item.sku}-250G`,
        price: item.price,
        stock: 100,
        description: "Quy cách gói 250g."
      }
    });
  }

  await prisma.promotion.upsert({
    where: { code: "PHINGO10" },
    update: {
      name: "Giảm 10 phần trăm",
      discountType: "PERCENT",
      discountValue: 10,
      isActive: true
    },
    create: {
      code: "PHINGO10",
      name: "Giảm 10 phần trăm",
      description: "Mã giảm giá mẫu cho khách hàng.",
      discountType: "PERCENT",
      discountValue: 10,
      isActive: true
    }
  });

  const pages = [
    {
      key: "about",
      title: "Về PHIN GO",
      slug: "about",
      content: "PHIN GO mang cà phê phin Việt Nam vào trải nghiệm thương mại điện tử hiện đại."
    },
    {
      key: "guide",
      title: "Hướng dẫn pha",
      slug: "guide",
      content: "Dùng nước nóng, cân đúng lượng cà phê và thời gian chiết xuất phù hợp để đạt vị cân bằng."
    },
    {
      key: "combo",
      title: "Combo PHIN GO",
      slug: "combo",
      content: "Nội dung combo đang được cập nhật."
    },
    {
      key: "contact",
      title: "Liên hệ",
      slug: "contact",
      content: "Liên hệ PHIN GO để mua hàng, hợp tác đại lý và tìm điểm bán gần bạn."
    }
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { key: page.key },
      update: {
        ...page,
        status: "PUBLISHED"
      },
      create: {
        ...page,
        status: "PUBLISHED"
      }
    });
  }

  const stores = [
    {
      id: "seed-store-district-1",
      name: "PHIN GO District 1",
      type: "SHOWROOM" as const,
      address: "12 Nguyễn Huệ",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      phone: "0280000001"
    },
    {
      id: "seed-store-ha-noi",
      name: "PHIN GO Ha Noi",
      type: "DEALER" as const,
      address: "25 Lý Thường Kiệt",
      city: "Hà Nội",
      district: "Hoàn Kiếm",
      phone: "0240000002"
    }
  ];

  for (const store of stores) {
    await prisma.storeLocation.upsert({
      where: { id: store.id },
      update: store,
      create: store
    });
  }

  await prisma.marketingMaterial.upsert({
    where: { id: "seed-banner-home" },
    update: {
      title: "Homepage banner",
      type: "IMAGE",
      fileUrl: "/images/img-1.png",
      description: "Banner trang chủ PHIN GO.",
      isActive: true
    },
    create: {
      id: "seed-banner-home",
      title: "Homepage banner",
      type: "IMAGE",
      fileUrl: "/images/img-1.png",
      description: "Banner trang chủ PHIN GO.",
      isActive: true
    }
  });

  const settings = [
    ["siteName", "PHIN GO"],
    ["slogan", "Gói tinh hoa - Pha tốc độ"],
    ["description", "PHIN GO gói trọn hương vị cà phê phin truyền thống trong túi lọc tiện lợi."],
    ["hotline", "1900 2026"],
    ["phone", "1900 2026"],
    ["email", "hello@phingo.vn"],
    ["address", "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"],
    ["workingHours", "Thứ 2 - Chủ nhật: 8:00 - 22:00"],
    ["facebookUrl", "https://facebook.com/phingo"],
    ["shopeeUrl", "https://shopee.vn/phingo"],
    ["tiktokUrl", "https://tiktok.com/@phingo"],
    ["googleMapUrl", "https://maps.google.com"],
    ["shippingFee", "25000"],
    ["freeShippingThreshold", "300000"],
    ["paymentMethod_COD", "true"],
    ["paymentMethod_BANK_TRANSFER", "true"],
    ["paymentMethod_MOMO", "false"],
    ["paymentMethod_VNPAY", "false"],
    ["paymentMethod_ZALOPAY", "false"],
    ["paymentMethod_CREDIT_CARD", "false"],
    ["bankName", "Vietcombank"],
    ["bankAccountNumber", "0000000000"],
    ["bankAccountHolder", "CONG TY PHIN GO"],
    ["bankTransferNoteTemplate", "PHINGO {orderCode}"],
    ["heroTitle", "PHIN GO"],
    ["heroSubtitle", "Chọn hương vị yêu thích, đăng nhập để checkout, áp mã giảm giá và theo dõi đơn hàng trong tài khoản của bạn."],
    ["heroImageUrl", "/images/img-1.png"],
    ["guideTitle", "4 bước đơn giản chuẩn vị phin Việt"],
    ["guideSubtitle", "Chỉ với vài thao tác nhanh chóng, bạn đã có ngay một ly cà phê đậm đà, thơm ngon đúng điệu."],
    ["guideImageUrl", "/images/img-2.png"],
    ["ctaTitle", "Chọn hương vị yêu thích, đặt hàng nhanh và theo dõi đơn trong tài khoản."],
    ["ctaSubtitle", "Khách hàng đăng nhập trước khi checkout để lưu địa chỉ giao hàng, áp mã giảm giá và theo dõi trạng thái thanh toán."],
    ["ctaImageUrl", "/images/img-3.png"]
  ] as const;

  for (const [key, value] of settings) {
    const group = key.startsWith("bank") || key.startsWith("paymentMethod_")
      ? "payment"
      : key === "shippingFee" || key === "freeShippingThreshold"
        ? "shipping"
        : key.startsWith("hero") || key.startsWith("guide") || key.startsWith("cta")
          ? "marketing"
          : "general";

    await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value,
        type: key.endsWith("Url") ? "URL" : "TEXT",
        group
      },
      create: {
        key,
        value,
        type: key.endsWith("Url") ? "URL" : "TEXT",
        group
      }
    });
  }

  console.info({
    admin: admin.email,
    customer: customer.email,
    password: "Phingo@123"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
