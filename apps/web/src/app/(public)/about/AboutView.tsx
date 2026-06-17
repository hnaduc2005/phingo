"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Coffee, MapPin, ArrowRight } from "lucide-react";

import { apiFetch, type ApiResponse } from "@/lib/api";
import { imageAssets } from "@/config/images";

type ContentPage = {
  title: string;
  content: string;
};

const values = [
  {
    icon: <Clock className="h-8 w-8 text-brand-gold" />,
    title: "Tiện lợi mỗi ngày",
    description: "Pha nhanh, gọn nhẹ, phù hợp với nhịp sống bận rộn.",
  },
  {
    icon: <Coffee className="h-8 w-8 text-brand-gold" />,
    title: "Giữ vị cà phê Việt",
    description: "Lấy cảm hứng từ thói quen pha phin truyền thống.",
  },
  {
    icon: <MapPin className="h-8 w-8 text-brand-gold" />,
    title: "Dễ dùng ở mọi nơi",
    description: "Phù hợp tại nhà, văn phòng hoặc khi di chuyển.",
  },
];

const products = [
  {
    name: "Original",
    description: "Cân bằng, đậm đà, vị cà phê phin truyền thống chuẩn gu người Việt.",
    image: imageAssets.productOriginal,
    link: "/products"
  },
  {
    name: "Bold Robusta",
    description: "Mạnh mẽ, đánh thức năng lượng với 100% hạt Robusta rang đậm.",
    image: imageAssets.productBoldRobusta,
    link: "/products"
  },
  {
    name: "Smooth Arabica",
    description: "Thơm nhẹ, vị chua thanh thoát, phù hợp thưởng thức mỗi chiều.",
    image: imageAssets.productSmoothArabica,
    link: "/products"
  }
];

export function AboutView() {
  const [page, setPage] = useState<ContentPage | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const payload = await apiFetch<ApiResponse<ContentPage>>(`/api/content/about`);
        if (!cancelled) setPage(payload.data);
      } catch {
        if (!cancelled) setPage(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = page?.title?.trim() || "Về PHIN GO";
  const content = page?.content?.trim() || "PHIN GO mang đến trải nghiệm cà phê phin đích thực nhưng với sự tiện lợi tối đa của phin giấy.";
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="bg-brand-cream min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-cream/30" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <span className="inline-block rounded-full bg-brand-gold/20 px-4 py-1.5 text-sm font-semibold text-brand-coffee mb-6">
            Gói tinh hoa – Pha tốc độ
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-coffee md:text-5xl lg:text-6xl mb-6">
            {title}
          </h1>
          <p className="text-lg text-brand-coffee/80 md:text-xl leading-relaxed mx-auto max-w-2xl">
            {paragraphs[0] || content}
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 lg:py-24 px-4 bg-brand-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-brand-coffee mb-6">Câu Chuyện Thương Hiệu</h2>
              <div className="space-y-4 text-brand-coffee/80 leading-relaxed text-lg">
                {isLoading ? (
                  <p>Đang tải nội dung...</p>
                ) : paragraphs.length > 1 ? (
                  paragraphs.slice(1).map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      Từ thói quen chờ đợi từng giọt cà phê phin rơi tí tách mỗi buổi sáng, PHIN GO ra đời nhằm lưu giữ nét văn hóa đẹp đẽ ấy nhưng được gói gọn trong sự tiện lợi của phin giấy.
                    </p>
                    <p>
                      Chúng tôi tin rằng, dù cuộc sống có bận rộn đến đâu, bạn vẫn xứng đáng có một ly cà phê chuẩn vị Việt ngay tại nhà hay nơi công sở mà không cần mất quá nhiều thời gian chuẩn bị.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative aspect-square lg:aspect-auto lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src={imageAssets.showroom} 
                alt="Câu chuyện PHIN GO" 
                fill 
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-white px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-coffee">Giá Trị Cốt Lõi</h2>
            <p className="text-brand-coffee/70 mt-2">Những gì chúng tôi cam kết mang lại cho bạn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-brand-cream/20 p-10 rounded-3xl border border-brand-cream text-center transition-transform hover:-translate-y-2">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-coffee mb-4">{value.title}</h3>
                <p className="text-brand-coffee/80 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 lg:py-24 bg-brand-cream px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-coffee">Sản Phẩm PHIN GO</h2>
            <p className="text-brand-coffee/70 mt-2">Khám phá dòng sản phẩm đa dạng phù hợp với mọi khẩu vị.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-cream/50 flex flex-col group">
                <div className="relative aspect-square w-full bg-brand-cream/30 p-8">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-brand-coffee mb-3">{product.name}</h3>
                  <p className="text-brand-coffee/70 mb-6 flex-grow">{product.description}</p>
                  <Link 
                    href={product.link}
                    className="inline-flex items-center text-brand-gold font-bold hover:text-brand-coffee transition-colors"
                  >
                    Xem sản phẩm <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-coffee px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Khám phá hương vị PHIN GO</h2>
          <p className="text-brand-cream/80 text-lg mb-10">
            Chọn dòng cà phê phù hợp với khẩu vị và thói quen hằng ngày của bạn.
          </p>
          <Link
            href="/products"
            className="inline-flex h-14 items-center justify-center rounded-full bg-brand-gold px-10 text-lg font-bold text-brand-coffee transition-transform hover:scale-105 shadow-lg shadow-brand-gold/20"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>
    </main>
  );
}
