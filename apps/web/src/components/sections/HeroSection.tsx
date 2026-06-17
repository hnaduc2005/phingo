"use client"

import Link from "next/link"
import { motion } from "framer-motion"

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
  const heroImage = safeImageSrc(settings?.heroImageUrl, imageAssets.hero3d)

  return (
    <section className="relative overflow-hidden bg-brand-cream py-20 lg:py-28">
      <div className="container relative z-10 mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex flex-wrap gap-3">
            <Badge variant="mustard">Pha nhanh 2-3 phút</Badge>
            <Badge variant="outline" className="border-brand-coffee/20">Cà phê Việt</Badge>
            <Badge variant="outline" className="border-brand-coffee/20">Mua online tiện lợi</Badge>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight text-brand-coffee lg:text-7xl">
            {heroTitle}
            <span className="block bg-gradient-to-r from-brand-mustard to-brand-gold bg-clip-text text-transparent">
              {heroSlogan}
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-brand-coffee/80">
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
          className="relative flex h-[420px] items-center justify-center lg:h-[560px]"
        >
          <FloatingImage
            src={heroImage}
            alt="PHIN GO Coffee"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized={isRemoteImageSrc(heroImage)}
          />
        </motion.div>
      </div>
    </section>
  )
}
