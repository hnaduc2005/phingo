import Image from "next/image"
import Link from "next/link"
import { MapPin, MessageCircle, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { imageAssets } from "@/config/images"

export function PurchaseCtaSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-mustard">
            Mua PHIN GO
          </p>
          <h2 className="max-w-2xl text-3xl font-bold text-brand-coffee md:text-4xl">
            Chọn hương vị yêu thích, đặt hàng nhanh và theo dõi đơn trong tài khoản.
          </h2>
          <p className="max-w-xl text-brand-coffee/70">
            Khách hàng đăng nhập trước khi checkout để lưu địa chỉ giao hàng, áp mã giảm giá và theo dõi trạng thái thanh toán.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="premium">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4" />
                Xem sản phẩm
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/stores">
                <MapPin className="h-4 w-4" />
                Tìm điểm bán
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact">
                <MessageCircle className="h-4 w-4" />
                Liên hệ hợp tác phân phối
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-beige">
          <Image
            src={imageAssets.showroom}
            alt="Điểm bán PHIN GO"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        </div>
      </div>
    </section>
  )
}
