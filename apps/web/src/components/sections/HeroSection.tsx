"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FloatingImage } from "@/components/common/FloatingImage"
import { imageAssets } from "@/config/images"
import { isRemoteImageSrc, safeImageSrc } from "@/lib/image-src"
import type { PublicSiteSettings } from "@/lib/site-settings"

type HeroSectionProps = {
  settings?: PublicSiteSettings
}

export function HeroSection({ settings }: HeroSectionProps) {
  const heroTitle = settings?.heroTitle?.trim() || "PHIN GO"
  const heroSlogan = settings?.slogan?.trim() || "cà phê phin pha nhanh"
  const heroSubtitle =
    settings?.heroSubtitle?.trim() ||
    "Chọn hương vị yêu thích, đăng nhập để checkout, áp mã giảm giá và theo dõi đơn hàng trong tài khoản của bạn."
  const heroFallbackImage = imageAssets.hero3d
  const heroImage = safeImageSrc(settings?.heroImageUrl, heroFallbackImage)
  const [failedHeroImage, setFailedHeroImage] = useState<string | null>(null)
  const heroImageSrc = failedHeroImage === heroImage ? heroFallbackImage : heroImage

  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,560px)] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-w-0 max-w-2xl space-y-7 lg:space-y-8"
        >
          <div className="flex flex-wrap gap-3">
            <Badge variant="mustard">Pha nhanh 2-3 phút</Badge>
            <Badge variant="outline" className="border-brand-coffee/20">Cà phê Việt</Badge>
            <Badge variant="outline" className="border-brand-coffee/20">Mua online tiện lợi</Badge>
          </div>

          <h1 className="text-[clamp(3rem,12vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-brand-coffee sm:text-[clamp(3.75rem,9vw,5.75rem)] lg:text-[clamp(4.5rem,6.5vw,6.5rem)]">
            {heroTitle}
            <span className="block bg-gradient-to-r from-brand-mustard to-brand-gold bg-clip-text text-transparent">
              {heroSlogan}
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-brand-coffee/80 sm:text-lg">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="premium" className="text-lg">
              <Link href="/products">Mua ngay</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-brand-coffee/20 text-lg text-brand-coffee hover:bg-brand-coffee/5">
              <Link href="/products">Xem sản phẩm</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-lg text-brand-coffee hover:bg-brand-coffee/5">
              <Link href="/stores">Tìm điểm bán</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto aspect-[4/3] w-full max-w-[560px]"
        >
          <FloatingImage
            src={heroImageSrc}
            alt="PHIN GO Coffee"
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
            unoptimized={isRemoteImageSrc(heroImageSrc)}
            onError={() => {
              if (heroImageSrc !== heroFallbackImage) {
                setFailedHeroImage(heroImage)
              }
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
