import React from "react"
import { GuideSection } from "@/components/sections/GuideSection"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Hướng dẫn pha - PHIN GO",
  description: "Cách pha cà phê phin giấy PHIN GO chuẩn vị nhất trong 4 bước đơn giản.",
}

export default function GuidePage() {
  return (
    <div className="bg-brand-coffee">
      <div className="pt-20 pb-10 text-center container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-cream mb-6">
          Nghệ thuật pha phin thời đại mới
        </h1>
        <p className="text-brand-beige/70 max-w-2xl mx-auto text-lg mb-8">
          Khám phá cách thức giữ trọn vẹn tinh hoa của cà phê phin Việt Nam mà không cần mất quá nhiều thời gian chờ đợi.
        </p>
      </div>
      
      <GuideSection />
      
      <div className="py-20 text-center container mx-auto px-4 border-t border-white/10">
        <h2 className="text-3xl font-bold text-white mb-8">Đã sẵn sàng để thưởng thức?</h2>
        <Link href="/products">
          <Button size="lg" variant="premium" className="text-lg px-12 h-14">
            Mua ngay PHIN GO
          </Button>
        </Link>
      </div>
    </div>
  )
}
