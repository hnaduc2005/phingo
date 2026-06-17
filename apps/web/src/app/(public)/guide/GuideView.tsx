"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coffee, Droplets, Utensils, CupSoda, CheckCircle2 } from "lucide-react";

import { apiFetch, type ApiResponse } from "@/lib/api";
import { VideoPreview } from "@/components/public/VideoPreview";
import { siteConfig } from "@/config/site";

type ContentPage = {
  title: string;
  content: string;
};

const steps = [
  {
    icon: <Utensils className="h-6 w-6 text-brand-coffee" />,
    title: "Bước 1: Xé gói phin giấy",
    description: "Xé theo đường ngang trên đầu gói phin giấy.",
  },
  {
    icon: <CupSoda className="h-6 w-6 text-brand-coffee" />,
    title: "Bước 2: Gài phin vào ly",
    description: "Kéo hai quai lọc ra và gài chắc vào miệng ly.",
  },
  {
    icon: <Droplets className="h-6 w-6 text-brand-coffee" />,
    title: "Bước 3: Ủ cà phê",
    description: "Rót một ít nước nóng và chờ khoảng 20–30 giây để cà phê nở đều.",
  },
  {
    icon: <Coffee className="h-6 w-6 text-brand-coffee" />,
    title: "Bước 4: Thưởng thức",
    description: "Rót thêm nước nóng, chờ cà phê chiết xuất rồi thêm đường, sữa hoặc đá theo khẩu vị.",
  },
];

const tips = [
  "Dùng nước nóng vừa đủ",
  "Ủ cà phê trước khi rót đầy",
  "Điều chỉnh đường, sữa, đá theo khẩu vị",
];

export function GuideView() {
  const [page, setPage] = useState<ContentPage | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const payload = await apiFetch<ApiResponse<ContentPage>>(`/api/content/guide`);
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

  const title = page?.title?.trim() || "Hướng dẫn pha PHIN GO";
  const content = page?.content?.trim() || "Pha cà phê phin lọc giấy nhanh chóng, gọn nhẹ và vẫn giữ trọn hương vị cà phê Việt.";

  return (
    <main className="bg-brand-cream min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-cream/30" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <span className="inline-block rounded-full bg-brand-gold/20 px-4 py-1.5 text-sm font-semibold text-brand-coffee mb-6">
            Chỉ vài phút để có một ly cà phê đậm vị
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-coffee md:text-5xl lg:text-6xl mb-6">
            {title}
          </h1>
          <p className="text-lg text-brand-coffee/80 md:text-xl leading-relaxed mx-auto max-w-2xl">
            {content}
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 lg:py-24 px-4 bg-brand-cream">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-coffee">Video Hướng Dẫn</h2>
            <p className="text-brand-coffee/70 mt-2">Xem cách pha một ly PHIN GO chuẩn vị</p>
          </div>
          <VideoPreview 
            thumbnailUrl={siteConfig.guideVideoThumbnailUrl}
            videoUrl={siteConfig.guideVideoUrl}
            title="Cách pha PHIN GO"
          />
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="py-16 lg:py-24 bg-white px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-coffee">4 Bước Pha Đơn Giản</h2>
            <p className="text-brand-coffee/70 mt-2">Dễ dàng thưởng thức cà phê mọi lúc mọi nơi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-brand-cream/30 p-8 rounded-2xl border border-brand-cream text-center transition-all hover:shadow-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/30 mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-coffee mb-3">{step.title}</h3>
                <p className="text-brand-coffee/80 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 lg:py-24 bg-brand-cream px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-brand-cream/50 flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3 text-center md:text-left">
              <h2 className="text-3xl font-bold text-brand-coffee mb-4">Mẹo Pha Ngon</h2>
              <p className="text-brand-coffee/70">Bí quyết để có một ly cà phê chuẩn vị như được pha tại quán.</p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tips.map((tip, index) => (
                <div key={index} className="bg-brand-cream/50 rounded-2xl p-6 text-center border border-brand-gold/10">
                  <CheckCircle2 className="h-8 w-8 text-brand-gold mx-auto mb-4" />
                  <p className="font-medium text-brand-coffee">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-coffee px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Sẵn sàng pha thử PHIN GO?</h2>
          <p className="text-brand-cream/80 text-lg mb-10">
            Chọn hương vị yêu thích và tự pha một ly cà phê phin tiện lợi ngay hôm nay.
          </p>
          <Link
            href="/products"
            className="inline-flex h-14 items-center justify-center rounded-full bg-brand-gold px-10 text-lg font-bold text-brand-coffee transition-transform hover:scale-105 shadow-lg shadow-brand-gold/20"
          >
            Mua ngay
          </Link>
        </div>
      </section>
    </main>
  );
}
