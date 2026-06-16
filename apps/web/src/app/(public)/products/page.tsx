import React from "react"
import { ProductShowcase } from "@/components/sections/ProductShowcase"

export const metadata = {
  title: "Sản phẩm - PHIN GO",
  description: "Khám phá các dòng sản phẩm cà phê phin giấy tiện lợi từ PHIN GO.",
}

export default function ProductsPage() {
  return (
    <div className="pt-8">
      <div className="container mx-auto px-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-coffee mb-6">
          Sản phẩm của chúng tôi
        </h1>
        <p className="text-brand-coffee/70 max-w-2xl mx-auto text-lg">
          Lựa chọn hương vị yêu thích của bạn. Mỗi gói PHIN GO đều được chăm chút tỉ mỉ từ khâu chọn hạt đến rang xay, mang lại trải nghiệm cà phê phin đúng chuẩn.
        </p>
      </div>
      
      {/* We reuse the ProductShowcase component but could add filters here if needed */}
      <ProductShowcase />
    </div>
  )
}
