import React from "react"
import Image from "next/image"
import { imageAssets } from "@/config/images"
import { isRemoteImageSrc, safeImageSrc } from "@/lib/image-src"
import type { PublicSiteSettings } from "@/lib/site-settings"

const steps = [
  {
    step: "01",
    title: "Xé túi lọc",
    description: "Xé đường ngang trên đầu gói phin giấy theo đường chỉ dẫn."
  },
  {
    step: "02",
    title: "Cố định phin",
    description: "Kéo hai quai trên gói phin giấy và gài chắc chắn vào thành ly."
  },
  {
    step: "03",
    title: "Ủ và châm nước",
    description: "Chế một ít nước sôi để ủ 20–30 giây, sau đó đổ thêm nước sôi vào đầy phin."
  },
  {
    step: "04",
    title: "Thưởng thức",
    description: "Lấy phin giấy ra và thưởng thức. Có thể thêm đường hoặc sữa tùy khẩu vị."
  }
]

type GuideSectionProps = {
  settings?: PublicSiteSettings
}

export function GuideSection({ settings }: GuideSectionProps) {
  const guideTitle = settings?.guideTitle?.trim() || "4 bước đơn giản chuẩn vị phin Việt"
  const guideSubtitle =
    settings?.guideSubtitle?.trim() ||
    "Chỉ với vài thao tác nhanh chóng, bạn đã có ngay một ly cà phê đậm đà, thơm ngon đúng điệu mà không cần bất kỳ dụng cụ pha chế phức tạp nào."
  const guideImage = safeImageSrc(settings?.guideImageUrl, imageAssets.brewingGuide)

  return (
    <section className="py-24 bg-brand-coffee text-brand-cream overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative h-[500px] lg:h-[700px] w-full rounded-3xl overflow-hidden">
            <Image
              src={guideImage}
              alt="Hướng dẫn pha PHIN GO"
              fill
              className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={isRemoteImageSrc(guideImage)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-coffee/80 to-transparent pointer-events-none" />
          </div>

          <div className="order-1 lg:order-2 space-y-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                {guideTitle}
              </h2>
              <p className="text-brand-beige/80 text-lg">
                {guideSubtitle}
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-brand-gold/30 text-brand-gold flex items-center justify-center text-2xl font-bold font-mono group-hover:bg-brand-gold group-hover:text-brand-coffee transition-all duration-300">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-mustard transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-brand-beige/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
